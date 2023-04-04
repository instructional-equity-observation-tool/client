import { useState, useRef, useEffect } from "react";
import axios from "axios";

import { knowledgeArray } from "../expertArrays/knowledge";
import { understandArray } from "../expertArrays/understand";
import { applyArray } from "../expertArrays/apply";
import { analyzeArray } from "../expertArrays/analyze";
import { evaluateArray } from "../expertArrays/evaluate";
import { createArray } from "../expertArrays/create";

import { uploadFile, transcribeFile } from "../utils/assemblyAPI";
import "./MainPage.css";
import "./transcript.scss"

import ProgressBar from "../progress";
import { Modal } from "bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "react-apexcharts";
import { Auth } from "aws-amplify";
import AWS from "aws-sdk";
import { Buffer } from "buffer";

export default function Submission() {
  const [completed, setCompleted] = useState(0);
  const [transcript, setTranscript] = useState();
  const [sentences, setSentences] = useState();

  const [times, setTimes] = useState();
  const [speakers, setSpeakers] = useState();
  const [questions, setQuestions] = useState();
  const [respTime, setRespTime] = useState();
  const [labeledQuestions, setLabeledQuestions] = useState();
  const [questioningTime, setQuestioningTime] = useState();

  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");

  const [reportName, setReportName] = useState("");

  const [fileContent, setFileContent] = useState();

  useEffect(() => {
    if (sentences) {
      createTranscript();
      findQuestions();
      toResponse();
      printTimes();
      setCompleted(0);
      hideModal();
      saveUserObject();
    }
  }, [sentences]);


  function handleInputChange(event){
    event.persist();
    setReportName(event.target.value);
  }

  async function saveUserObject(){
    AWS.config.update({ 
      region: 'us-east-2',
      apiVersion: 'latest',
      credentials: {
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ID,
      } 
    });
    const s3 = new AWS.S3();
    var userObject = sentences;
    var buf = Buffer.from(JSON.stringify(userObject));
    const user = await Auth.currentAuthenticatedUser();
    console.log(user.username);
    const folderName = user.username;
    console.log(reportName)
    const location = folderName + "/" + reportName;
    console.log(location)
    var data = {
      Bucket: 'user-analysis-objs183943-staging',
      Key: location,
      Body: JSON.stringify(sentences),
      ContentEncoding: 'base64',
      ContentType: 'application/json',
      ACL: 'public-read',
    }; 
    s3.putObject(data, function (err, data) {
      if (err) {
          console.log(err);
          console.log('Error uploading data: ', data);
      } else {
          console.log('succesfully uploaded!!!');
      }
    });
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setSelectedFile(event.target.files[0]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = (event) => {
      setFileContent(event.target.result);
    };
    const type = file.type;
    if (type.includes("audio")) {
      setIsAudio(true);
      setIsVideo(false);
    } else if (type.includes("video")) {
      setIsVideo(true);
      setIsAudio(false);
    } else {
      setIsAudio(false);
      setIsVideo(false);
    }
  }

  let handleSubmission = async () => {
    showModal();
    // document.getElementById('name-report').readonly = true;

    let interval = setInterval(() => {
      it += 1;
      setCompleted(it);
      if (it === 95) {
        clearInterval(interval);
        it = 0;
      }
    }, 2000);

    const audioUrl = await uploadFile(fileContent);
    const transcriptionResult = await transcribeFile(audioUrl);
    console.log("transcriptionResult: ", transcriptionResult);
    setSentences(transcriptionResult);
  };

  function createTranscript() {
    let transcript = "";
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        transcript += " " + sentences[i].text;
      }
      setTranscript(transcript);
    }
  }

  let it = 0;

  const modalRef = useRef();

  const showModal = () => {
    const modalEle = modalRef.current;
    const bsModal = new Modal(modalEle, {
      backdrop: "static",
      keyboard: false,
    });
    bsModal.show();
  };

  const hideModal = () => {
    const modalEle = modalRef.current;
    const bsModal = Modal.getInstance(modalEle);
    bsModal.hide();
  };

  function findQuestions() {
    let qs = [];
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].text.includes("?")) {
          qs.push(sentences[i]);
        }
      }
      setQuestions(qs);
      findQuestionsLabels(qs);
      return qs;
    }
  }

  function toResponse() {
    const qs = {};

    if (sentences) {
      // iterate through the sentences and find the questions
      for (let i = 0; i < sentences.length; i++) {
        //const sentence = sentences[i];
        if (sentences[i].text.includes("?")) {
          qs[sentences[i].end] = sentences[i];
        }
      }

      //

      // iterate through the sentences again and find the responses to the questions
      const responses = [];
      let lastq = 999999999;
      let spek = "";
      let passable = false;
      for (let i = 0; i < sentences.length; i++) {
        //const sentence = sentences[i];
        if (sentences[i].text.includes("?")) {
          // this is a question, so skip it
          lastq = sentences[i].end;
          spek = sentences[i].speaker;
          passable = true;
          continue;
        }
        if (sentences[i].start > lastq && sentences[i].speaker !== spek && passable) {
          // this is a response to a question, so add it to the responses list
          //
          //
          responses.push(sentences[i]);
          passable = false;
        }
      }

      const stamps = {};
      let currR;
      let currQ;

      for (let q in qs) {
        stamps[q] = "No Response";
      }

      for (let i = 0; i < responses.length; i++) {
        currR = responses[i].start;
        for (let s in qs) {
          if (qs[s].end < currR) {
            currQ = qs[s].end;
          }
        }
        stamps[currQ] = convertMsToTime(currR - currQ);
      }

      // return the list of responses

      setRespTime(stamps);
      return stamps;
    }
  }

  function printTimes() {
    if (sentences) {
      let sStamps = [];
      let speaks = [];
      let qDur = 0;
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].text.includes("?")) {
          qDur += sentences[i].end - sentences[i].start;
          sStamps.push(convertMsToTime(sentences[i].start));
          speaks.push(sentences[i].speaker);
        }
      }
      it = 0;
      setQuestioningTime(convertMsToTime(qDur));
      setTimes(sStamps);
      setSpeakers(speaks);
      return sStamps;
    }
  }

  function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }

  function convertMsToTime(milliseconds) {
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds = seconds % 60;
    minutes = minutes % 60;

    // 👇️ If you don't want to roll hours over, e.g. 24 to 00
    // 👇️ comment (or remove) the line below
    // commenting next line gets you `24:00:00` instead of `00:00:00`
    // or `36:15:31` instead of `12:15:31`, etc.
    hours = hours % 24;

    return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
  }

  function findQuestionsLabels(quests) {
    const categoryMap = {
      Knowledge: knowledgeArray,
      Analyze: analyzeArray,
      Apply: applyArray,
      Create: createArray,
      Evaluate: evaluateArray,
      Understand: understandArray,
    };

    const sanitizeWord = (word) => word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").replace(/\s{2,}/g, " ");

    const findCategories = (word) =>
      Object.keys(categoryMap)
        .filter((key) => categoryMap[key].includes(word))
        .join(" or ");

    const labeled = quests.map((quest) => {
      const categories = quest.words
        .map((wordObj) => sanitizeWord(wordObj.text))
        .map(findCategories)
        .filter((category) => category.length > 0);

      return categories.length > 0 ? categories.join(" or ") : "Uncategorized";
    });

    setLabeledQuestions(labeled);

    return labeled;
  }

  function removeQuestion(idx) {
    let newQuestions = [...questions];
    newQuestions.splice(idx, 1);
    labeledQuestions.splice(idx, 1);
    times.splice(idx, 1);
    setQuestions(newQuestions);
  }

  function selectLabel(index, label) {
    let newLabeledQuestions = [...labeledQuestions];
    newLabeledQuestions[index] = label;
    setLabeledQuestions(newLabeledQuestions);
  }

  function getAmountOfLabel(label) {
    let amount = 0;
    if (labeledQuestions) {
      for (let i = 0; i < labeledQuestions.length; i++) {
        if (labeledQuestions[i] == label) {
          amount++;
        }
      }
      return amount;
    }
  }

  function getMaxSpeaker() {
    let speakTimeList1 = totalSpeakers();
    let maxSpeakerName = "";
    let maxSpeakerDuration = 0;
    let tempSpeaker = 0;
    if (speakTimeList1) {
      for (let i = 0; i < speakTimeList1.length; i++) {
        tempSpeaker = getSpeakingTime(speakTimeList1[i]);

        if (tempSpeaker > maxSpeakerDuration) {
          maxSpeakerDuration = tempSpeaker;
          maxSpeakerName = speakTimeList1[i];
        }
      }
      return maxSpeakerName;
    }
  }

  function timeObj(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  function setTimeChartData() {
    if (labeledQuestions) {
      let data = [];
      //console.log("labeledQuestions: ", labeledQuestions);
      //make initial rows
      let categories = ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
      for (let i = 0; i < categories.length; i++) {
        let timeListObj = new timeObj(categories[i], [0, 0]);
        data.push(timeListObj);
      }

      for (let i = 0; i < labeledQuestions.length; i++) {
        if (categories.includes(labeledQuestions[i])) {
          //if(convertMsToTime(((questions[i].end / 1000) - (questions[i].start / 1000))) < 5){
          //let timeListObj = new timeObj(labeledQuestions[i], [questions[i].start / 1000, (questions[i].start / 1000) + 2]);
          //data.push(timeListObj);
          //}
          //else{
          let timeListObj = new timeObj(labeledQuestions[i], [questions[i].start / 1000, questions[i].start / 1000 + 5]);
          data.push(timeListObj);
          //}
        }
      }
      return data;
    }
  }

  const timeChartProps = {
    series: [
      {
        data: setTimeChartData(),
      },
    ],
    options: {
      chart: {
        type: "rangeBar",
      },
      title: {
        text: "Teacher Question Timeline",
        align: "left",
        style: {
          fontSize: "30px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
        },
      },
      xaxis: {
        type: "numeric",
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "20px",
          },
        },
        categories: ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create"],
      },
    },
  };

  const barChartProps = {
    options: {
      //plotOptions: {
        //bar: {
          //distributed: true
        //}
      //},
      title: {
        text: "Question Category Distribution",
        align: "left",
        style: {
          fontSize: "30px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "28px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: "bold",
        },
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "20px",
          },
        },
        categories: ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create", "Uncategorized"],
      },
    },
    series: [{
      data: [
        {
          x: "Knowledge",
          y: getAmountOfLabel("Knowledge"),
          fillColor: '#0000FF',
          strokeColor: '#000000'
        }, {
          x: "Understand",
          y: getAmountOfLabel("Understand"),
          fillColor: '#D42AC8',
          strokeColor: '#C23829'
        }, {
          x: "Apply", 
          y: getAmountOfLabel("Apply"),
          fillColor: '#009400',
          strokeColor: '#C23829'
        }, {
          x: "Analyze",
          y: getAmountOfLabel("Analyze"),
          fillColor: '#FF7300',
          strokeColor: '#C23829'
        }, {
          x: "Evaluate",
          y: getAmountOfLabel("Evaluate"),
          fillColor: '#FFC400',
          strokeColor: '#000000'
        }, {
          x: "Create",
          y: getAmountOfLabel("Create"),
          fillColor: '#7C7670',
          strokeColor: '#C23829'
        }, {
          x: "Uncategorized",
          y: getAmountOfLabel("Uncategorized"),
          fillColor: '#FF0000',
          strokeColor: '#C23829'
        }
      ]  
    }]
  };

  const pieChartProps = {
    options: {
      title: {
        text: "Talking Distribution",
        align: "left",
        style: {
          fontSize: "30px",
          fontWeight: "bold",
          fontFamily: undefined,
          color: "#263238",
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "28px",
          fontFamily: "Helvetica, Arial, sans-serif",
          fontWeight: "bold",
        },
      },
      labels: ["Teacher", "Students", "Non-Speaking"],
    },
    series: [getSpeakingTime(getMaxSpeaker()), sumSpeakingTime() - getSpeakingTime(getMaxSpeaker()), getNonSpeakingTime(sentences)],
  };

  function getNonSpeakingTime(sentences) {
    if (sentences) return sentences[sentences.length - 1].end - sentences[0].start - sumSpeakingTime(sentences);
  }

  function getSpeakingTime(speakerName) {
    let speakingTime = 0;
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].speaker === speakerName) {
          speakingTime += sentences[i].end - sentences[i].start;
        }
      }
    }
    return speakingTime;
  }

  function generatePDF() {
    if (sentences) {
      let doc = new jsPDF("p", "pt", "letter");

      let sentenceArray = new Array();
      for (let i = 0; i < sentences.length; i++) {
        sentenceArray[i] = new Array(sentences[i].speaker, sentences[i].text, convertMsToTime(sentences[i].end - sentences[i].start));
      }

      let questionArray = new Array();
      for (let i = 0; i < questions.length; i++) {
        questionArray[i] = new Array(questions[i].text, labeledQuestions[i]);
      }

      let y = 10;
      doc.setLineWidth(2);
      doc.text(200, (y = y + 30), "Your File Analysis Report");
      doc.autoTable({
        head: [["Speaker", "Sentence", "Duration"]],
        body: sentenceArray,
        startY: 70,
        theme: "grid",
      });

      doc.addPage();
      doc.autoTable({
        head: [["Question", "Category"]],
        body: questionArray,
        theme: "grid",
      });

      doc.save("demo.pdf");
    }
  }

  function sumSpeakingTime() {
    if (sentences) {
      let totalTime = 0;
      for (let i = 0; i < sentences.length; i++) {
        totalTime += sentences[i].end - sentences[i].start;
      }
      return totalTime;
    }
  }

  function totalSpeakers() {
    let speakerList = [];
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (!speakerList.includes(sentences[i].speaker)) {
          speakerList.push(sentences[i].speaker);
        }
      }
      return speakerList;
    }
  }

  return (
    <div>
      <div>
        <label className="form-label" htmlFor="customFile">
          <h4>Please Upload a File for Transcription</h4>
          <p>.MTS files are not compatible with the video player feature. Please convert to .mp4 file</p>
        </label>
        <input type="file" className="form-control" id="customFile" onChange={handleFileChange} />
        {isAudio ? (
          <div>
            <audio controls id="audio-player">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
            </audio>
            <div>
              <input placeholder="TEST INPUT" onChange={handleInputChange} id="name-report"></input>
            </div>
          </div>
        ) : (
          <p></p>
        )}
        {isVideo ? (
          <div>
            <video controls id="video-player">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
            </video>
          </div>
        ) : (
          <p></p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#progressModal"
          onClick={() => handleSubmission({selectedFile})}
        >
          Submit
        </button>
        <div className="addEmployee">
          <div className="modal fade" ref={modalRef} tabIndex="-1" style={{ marginTop: "115px" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="staticBackdropLabel">
                    Analyzing
                  </h5>
                </div>
                <div className="modal-body">
                  <div>
                    <ProgressBar bgcolor={"#6a1b9a"} completed={completed} />
                  </div>
                  <button
                    onClick={() => window.location.reload(false)}
                    style={{
                      backgroundColor: "dodgerblue",
                      color: "white",
                      padding: "5px 15px",
                      borderRadius: "5px",
                      border: "0",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {sentences && (
        <div>
          <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
            <h1>Full Transcript</h1>
            <div className="lead" style={{ backgroundColor: "white" }}>
              <table className="transcriptTable">
                {sentences.map((sentence) => (
                  <tbody>
                    <p className="sentence">
                      <tr>
                        <td>
                          <span className="transcript-time">{convertMsToTime(sentence.start)}</span>
                          <span className={`transcript-speaker speaker-${sentence.speaker}`}>Speaker {sentence.speaker} :</span>
                          <span className="transcript-text">{sentence.text}</span>
                        </td>
                      </tr>
                    </p>
                  </tbody>
                ))}
              </table>
            </div>
          </div>
          <div className="card-deck mb-3 text-center">
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h2>Questions</h2>
              </div>
              <div className="card-header">
                <h5>Number of Questions: {questions && questions.length}</h5>
                <h5>Total Questioning Time: {questioningTime}</h5>
              </div>
              <div className="card-body">
                <div className="container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Time</th>
                        <th scope="col">Question</th>
                        <th scope="col">Speaker</th>
                        <th scope="col">Response Time</th>
                        <th scope="col">Question Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions &&
                        questions.map((question, index) => (
                          <tr className="question">
                            <td>{times[index]}</td>
                            <td>"{question.text}"</td>
                            <td>{speakers[index]}</td>
                            <td>{respTime[question.end]}</td>
                            <td>{labeledQuestions[index]}</td>
                            <div className="question-options">
                              <Dropdown>
                                <Dropdown.Toggle variant="sm" id="dropdown-basic">
                                  Select Type
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Knowledge");
                                    }}
                                  >
                                    Knowledge
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Understand");
                                    }}
                                  >
                                    Understand
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Apply");
                                    }}
                                  >
                                    Apply
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Analyze");
                                    }}
                                  >
                                    Analyze
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Evaluate");
                                    }}
                                  >
                                    Evaluate
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      selectLabel(index, "Create");
                                    }}
                                  >
                                    Create
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                              <button type="button" class="btn btn-danger" onClick={() => removeQuestion(index)}>
                                Remove
                              </button>
                            </div>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              <tr>
                <td>
                  <Chart options={barChartProps.options} series={barChartProps.series} type="bar" width="650" />
                </td>
                <td>
                  <Chart options={pieChartProps.options} series={pieChartProps.series} type="pie" width="650" />
                </td>
              </tr>
              <br></br>
              <tr>
                <td>
                  <Chart options={timeChartProps.options} series={timeChartProps.series} type="rangeBar" height={600} width={1300} />
                </td>
              </tr>
            </div>
          </div>

          <div>
            <button onClick={() => generatePDF(transcript, sentences, questions)} type="primary">
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
