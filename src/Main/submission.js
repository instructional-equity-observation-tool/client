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

import ProgressBar from "../progress";
import { Modal } from "bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "react-apexcharts";

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

  const [fileContent, setFileContent] = useState();

  useEffect(() => {
    if (sentences) {
      createTranscript();
      findQuestions();
      toResponse();
      printTimes();
      setCompleted(0);
      hideModal();
    }
  }, [sentences]);

  function handleFileChange(event) {
    const file = event.target.files[0];
    setSelectedFile(event.target.files[0])
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = (event) => {
      setFileContent(event.target.result);
    };
    const type = file.type
    if (type.includes('audio')) {
      setIsAudio(true);
      setIsVideo(false);
    } else if (type.includes('video')) {
      setIsVideo(true);
      setIsAudio(false);
    } else {
      setIsAudio(false);
      setIsVideo(false);
    }
  }

  let handleSubmission = async () => {
    showModal();

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
    let labeled = new Array(quests.length);

    for (let j = 0; j < labeled.length; j++) {
      labeled[j] = "";
    }

    for (let i = 0; i < quests.length; i++) {
      for (let j = 0; j < quests[i].words.length; j++) {
        let tempWord = quests[i].words[j].text.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").replace(/\s{2,}/g, " ");

        if (knowledgeArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Knowledge";
          } else if (!labeled[i].includes("Knowledge")) {
            labeled[i] += " or Knowledge";
          }
        }

        if (analyzeArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Analyze";
          } else {
            labeled[i] += " or Analyze";
          }
        }

        if (applyArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Apply";
          } else if (!labeled[i].includes("Apply")) {
            labeled[i] += " or Apply";
          }
        }

        if (createArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Create";
          } else if (!labeled[i].includes("Create")) {
            labeled[i] += " or Create";
          }
        }

        if (evaluateArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Evaluate";
          } else if (!labeled[i].includes("Evaluate")) {
            labeled[i] += " or Evaluate";
          }
        }

        if (understandArray.some((v) => tempWord === v)) {
          if (labeled[i] === "") {
            labeled[i] = "Understand";
          } else if (!labeled[i].includes("Understand")) {
            labeled[i] += " or Understand";
          }
        }
      }

      if (labeled[i] === "") {
        labeled[i] = "Non-Bloom's";
      }
    }

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
    if (sentences) {
      let data = [];
      for (let i = 0; i < sentences.length; i++) {
        let timeListObj = new timeObj(sentences[i].speaker, [sentences[i].start / 1000, sentences[i].end / 1000]);
        data.push(timeListObj);
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
        text: "Speaking Timeline",
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
    },
  };

  const barChartProps = {
    options: {
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
        categories: ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create"],
      },
    },
    series: [
      {
        data: [
          getAmountOfLabel("Knowledge"),
          getAmountOfLabel("Understand"),
          getAmountOfLabel("Apply"),
          getAmountOfLabel("Analyze"),
          getAmountOfLabel("Evaluate"),
          getAmountOfLabel("Create"),
        ],
      },
    ],
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
    //series: [...speakingTimeList()],
    series: [getSpeakingTime(getMaxSpeaker()), sumSpeakingTime() - getSpeakingTime(getMaxSpeaker()), getSpeakingTime("B")],
  };

  function speakingTimeList() {
    if (sentences) {
      let speakingTimeList = [];
      let speakerList = totalSpeakers();

      for (let i = 0; i < speakerList.length; i++) {
        speakingTimeList.push(getSpeakingTime(speakerList[i]));
      }

      //
      return speakingTimeList;
    }
  }

  function getSpeakingTime(speakerName) {
    //
    let speakingTime = 0;
    if (sentences) {
      for (let i = 0; i < sentences.length; i++) {
        if (sentences[i].speaker === speakerName) {
          speakingTime += sentences[i].end - sentences[i].start;
        }
      }
    }
    //
    //
    //
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
        //
        questionArray[i] = new Array(questions[i].text, labeledQuestions[i]);
        //
      }

      //let speakTimeArray = new Array();
      //for(let i = 0; i < questions.length; i++){
      //speakTimeArray[i] = new Array(speakTimeArray[i].text, "Question Category");
      //
      //}

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

  return(
    <div>
        <div>
        <label className="form-label" htmlFor="customFile">
            <h4>Please Upload a File for Transcription</h4>
            <p>.MTS files are not compatible with the video player feature. Please convert to .mp4 file</p>
        </label>
        <input type="file" className="form-control" id="customFile" onChange={handleFileChange}/>
        {isAudio ? (
        <div>
            <audio controls id="audio-player">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
            </audio>
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
            <div className="lead">
              {sentences.map((sentence) => (
                <p className="sentence">
                  <span className="transcript-time">{convertMsToTime(sentence.start)}</span>
                  <span className="transcript-speaker">Speaker {sentence.speaker} :</span>
                  <span className="transcript-text">"{sentence.text}"</span>
                </p>
              ))}
            </div>
          </div>

          <div className="card-deck mb-3 text-center">
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h2>Questions</h2>
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
                          <tr>
                            <td>{times[index]}</td>
                            <td>"{question.text}"</td>
                            <td>{speakers[index]}</td>
                            <td>{respTime[question.end]}</td>
                            <td>{labeledQuestions[index]}</td>
                            <td>
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
                            </td>
                            <td>
                              <button type="button" class="btn btn-danger" onClick={() => removeQuestion(index)}>
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h2>Number of Questions</h2>
              </div>
              <div className="card-body">
                <h2>{questions && questions.length}</h2>
              </div>
            </div>
            <div className="card mb-4 box-shadow">
              <div className="card-header">
                <h2>Total Questioning Time</h2>
              </div>
              <div className="card-body">
                <h2>{questioningTime}</h2>
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
              {/* <tr>
                  <td>
                    <Chart
                      options={timeChartProps.options}
                      series={timeChartProps.series}
                      type="rangeBar"
                      height={600}
                      width={1300}
                    />
                  </td>
                </tr> */}
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
