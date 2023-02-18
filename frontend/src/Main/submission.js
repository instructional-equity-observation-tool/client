import { useState, useRef } from "react";
import axios from "axios";

import { knowledgeArray } from "../expertArrays/knowledge";
import { understandArray } from "../expertArrays/understand";
import { applyArray } from "../expertArrays/apply";
import { analyzeArray } from "../expertArrays/analyze";
import { evaluateArray } from "../expertArrays/evaluate";
import { createArray } from "../expertArrays/create";

import ProgressBar from "../progress";
import { Modal } from "bootstrap";
import Dropdown from "react-bootstrap/Dropdown";
import jsPDF from "jspdf";
import Chart from "react-apexcharts";

export default function Submission() {
  const [completed, setCompleted] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [sentences, setSentences] = useState("");
  const [times, setTimes] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [questions, setQuestions] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [labeledQuestions, setLabeledQuestions] = useState("");
  const [questioningTime, setQuestioningTime] = useState("");

  const [selectedFile, setSelectedFile] = useState("");
  const [isSelected, setIsSelected] = useState(false);

  const endpoint = "http://localhost:5000/upload";

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
    setIsSelected(true);
  }

  let handleSubmission = () => {
    showModal();

    let interval = setInterval(() => {
      it += 1;
      setCompleted(it);
      if (it === 95) {
        clearInterval(interval);
        it = 0;
      }
    }, 2000);

    const data = new FormData();
    data.append("file", selectedFile);
    axios.post(endpoint, data).then((res) => {
      console.log("res: ", res);
      it = 0;
      setSentences(res.data.sentences);
      createTranscript(res.data.sentences);
      findQuestions(res.data.sentences);
      printTimes(res.data.sentences);
      setCompleted(0);
      hideModal();
    });
  };

  function createTranscript(sentences) {
    let transcript = "";
    for (let i = 0; i < sentences.length; i++) {
      transcript += " " + sentences[i].text;
    }
    setTranscript(transcript);
    return transcript;
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

  function findQuestions(sentences) {
    let qs = [];
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].text.includes("?")) {
        qs.push(sentences[i]);
      }
    }
    setQuestions(qs);
    setNumQuestions(qs.length);
    findQuestionsLabels(qs);
    return qs;
  }

  function printTimes(sentences) {
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

<<<<<<< HEAD
    var handleSubmission = () => {
        if (isDisabled) {
          return;
        }
        setIsDisabled(true);
        showModal();

        var interval = setInterval(() => {
          it += 1;
          console.log(completed);
          setCompleted(it);
          if (it === 95) {
            clearInterval(interval);
            it = 0;
          }
          //do whatever here..
        }, 2000);
        const data = new FormData();
        data.append("file", selectedFile);
        axios.post(endpoint, data).then((res) => {
          console.log(res);
          it = 0;
          setSentences(res.data.sentences);
          createTranscript(res.data.sentences);
          findQuestions(res.data.sentences);
          printTimes(res.data.sentences);
          setCompleted(0);
        });
      };

      function createTranscript(sentences) {
        var transcript = "";
        for (let i = 0; i < sentences.length; i++) {
          transcript += " " + sentences[i].text;
        }
        setTranscript(transcript);
        setIsDisabled(false);
        hideModal();
        return transcript;
      }

        var it = 0;

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

      function findQuestions(sentences) {
        var qs = [];
        for (let i = 0; i < sentences.length; i++) {
          if (sentences[i].text.includes("?")) {
            qs.push(sentences[i]);
          }
        }
        setQuestions(qs);
        setNumQuestions(qs.length);
        findQuestionsLabels(qs);
        return qs;
      }

      function printTimes(sentences) {
        var sStamps = [];
        var speaks = [];
        var qDur = 0;
        for (let i = 0; i < sentences.length; i++) {
          console.log(sentences[i].text.includes("?"));
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
        var labeled = new Array(quests.length);
    
        for (var j = 0; j < labeled.length; j++) {
          labeled[j] = "";
        }
    
        for (let i = 0; i < quests.length; i++) {
          for (let j = 0; j < quests[i].words.length; j++) {
            var tempWord = quests[i].words[j].text
              .replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "")
              .replace(/\s{2,}/g, " ");
    
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
    
=======
    for (let i = 0; i < quests.length; i++) {
      for (let j = 0; j < quests[i].words.length; j++) {
        let tempWord = quests[i].words[j].text.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").replace(/\s{2,}/g, " ");

        if (knowledgeArray.some((v) => tempWord === v)) {
>>>>>>> origin/main
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
    setQuestions(newQuestions);
  }

  function selectLabel(index, label) {
    let newLabeledQuestions = [...labeledQuestions];
    newLabeledQuestions[index] = label;
    setLabeledQuestions(newLabeledQuestions);
  }

  function getAmountOfLabel(label) {
    let amount = 0;
    for (let i = 0; i < labeledQuestions.length; i++) {
      if (labeledQuestions[i] == label) {
        amount++;
      }
    }
    return amount;
  }

  function getMaxSpeaker() {
    let speakTimeList1 = totalSpeakers(sentences);
    let maxSpeakerName = "";
    let maxSpeakerDuration = 0;
    let tempSpeaker = 0;
    for (let i = 0; i < speakTimeList1.length; i++) {
      tempSpeaker = getSpeakingTime(speakTimeList1[i]);

      if (tempSpeaker > maxSpeakerDuration) {
        maxSpeakerDuration = tempSpeaker;
        maxSpeakerName = speakTimeList1[i];
      }
    }
    return maxSpeakerName;
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
    series: [getSpeakingTime(getMaxSpeaker()), sumSpeakingTime(sentences) - getSpeakingTime(getMaxSpeaker()), getSpeakingTime("B")],
  };

  function speakingTimeList() {
    let speakingTimeList = [];
    let speakerList = totalSpeakers(sentences);

    for (let i = 0; i < speakerList.length; i++) {
      speakingTimeList.push(getSpeakingTime(speakerList[i]));
    }

    //
    return speakingTimeList;
  }

  function getSpeakingTime(speakerName) {
    //
    let speakingTime = 0;
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].speaker === speakerName) {
        speakingTime += sentences[i].end - sentences[i].start;
      }
    }
    //
    //
    //
    return speakingTime;
  }

  function generatePDF() {
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

  //functions pasted from Micah Branch
  function sumSpeakingTime(sentences) {
    let totalTime = 0;
    for (let i = 0; i < sentences.length; i++) {
      totalTime += sentences[i].end - sentences[i].start;
    }
    return totalTime;
  }

  function totalSpeakers(sentences) {
    let speakerList = [];
    for (let i = 0; i < sentences.length; i++) {
      if (!speakerList.includes(sentences[i].speaker)) {
        speakerList.push(sentences[i].speaker);
      }
    }
    //
    //for (let i = 0; i < speakerList.length; i++) {
    //
    //}
    //
    return speakerList;
  }

  return (
    <div>
      <div>
        <label className="form-label" htmlFor="customFile">
          Please Upload a File for Transcription
        </label>
        <input type="file" className="form-control" id="customFile" onChange={handleFileChange} />
        {isSelected ? (
          <div>
            <p>Filename: {selectedFile.name}</p>
            <p>Filetype: {selectedFile.type}</p>
            <p>Size in bytes: {selectedFile.size}</p>
            <p>lastModifiedDate: {selectedFile.lastModifiedDate.toLocaleDateString()}</p>
          </div>
        ) : (
          <p>Select a file to show details</p>
        )}
        <button
          type="button"
          className="btn btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#progressModal"
          onClick={() => handleSubmission({ selectedFile })}
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
      {sentences ? (
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
                        <th scope="col">Question Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((question, index) => (
                        <tr>
                          <td>{times[index]}</td>
                          <td>"{question.text}"</td>
                          <td>{speakers[index]}</td>
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
                            <button onClick={() => removeQuestion(index)}>Remove</button>
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
                <h2>{numQuestions}</h2>
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
      ) : null}
    </div>
  );
}