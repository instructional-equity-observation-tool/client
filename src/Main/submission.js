import React, { useState, useRef, useEffect } from "react";
import { knowledgeArray } from "../expertArrays/knowledge";
import { understandArray } from "../expertArrays/understand";
import { applyArray } from "../expertArrays/apply";
import { analyzeArray } from "../expertArrays/analyze";
import { evaluateArray } from "../expertArrays/evaluate";
import { createArray } from "../expertArrays/create";

import { uploadFile, transcribeFile } from "../utils/assemblyAPI";
import "./MainPage.css";
import "./transcript.scss";

import Dropdown from "react-bootstrap/Dropdown";
import Spinner from "react-bootstrap/Spinner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Chart from "react-apexcharts";
import { Auth } from "aws-amplify";
import AWS from "aws-sdk";
import { Buffer } from "buffer";
import { useLocation, useNavigate } from "react-router-dom";

export default function Submission() {
  const [transcript, setTranscript] = useState();
  const [sentences, setSentences] = useState();

  const [times, setTimes] = useState();
  const [speakers, setSpeakers] = useState();
  console.log('speakers: ', speakers);
  const [questions, setQuestions] = useState();
  const [respTime, setRespTime] = useState();
  const [labeledQuestions, setLabeledQuestions] = useState();
  const [questioningTime, setQuestioningTime] = useState();
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isNeither, setIsNeither] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedFile, setSelectedFile] = useState("");
  const [reportName, setReportName] = useState("");
  const [fileContent, setFileContent] = useState();
  const [show, setShow] = useState(false);
  const [isRelabelingSpeaker, setIsRelabelingSpeaker] = useState(false);
  const [editing, setEditing] = useState(false);
  const [successfullUpload, setSuccessfullUpload] = useState(false);
  const [badReportName, setBadReportName] = useState(false);

  const[transcriptSpeakers, setTranscriptSpeakers] = useState([]);

  
  let navigate = useNavigate();

  const location = useLocation();
  const userReportToLoad = location.state?.data;
  const userReportLocation = location.state?.location;

  useEffect(() => {
    checkLoadReport();
  }, []);

  useEffect(() => {
    if (sentences) {
      createTranscript();
      findQuestions();
      findSpeakers();
      toResponse();
      printTimes();
    }
  }, [sentences]);

  useEffect(() => {
    if (questions) {
      toResponse();
      printTimes();
    }
  }, [questions]);

  function findSpeakers() {
    const speakersSet = new Set(speakers);

    sentences.forEach((sentence) => {
      speakersSet.add(sentence.speaker);
    });
    setSpeakers(speakersSet);
  }

  function checkLoadReport() {
    if (userReportToLoad) {
      setSentences(userReportToLoad);
    }
  }

  function handleInputChange(event) {
    event.persist();
    setReportName(event.target.value);
  }

  async function saveUserObject() {
    AWS.config.update({
      region: "us-east-2",
      apiVersion: "latest",
      credentials: {
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_SECRET_ID,
      },
    });

    const s3 = new AWS.S3();
    if (userReportToLoad) {
      var data = {
        Bucket: "user-analysis-objs183943-staging",
        Key: userReportLocation,
        Body: JSON.stringify(sentences),
        ContentEncoding: "base64",
        ContentType: "application/json",
        ACL: "public-read",
      };

      s3.putObject(data, function (err, data) {
        if (err) {
        } else {
          setSuccessfullUpload(true);
        }
      });
    } else {
      const user = await Auth.currentAuthenticatedUser();
      const folderName = user.username;
      const location = folderName + "/" + reportName;
      if(reportName === ""){
        setBadReportName(true)
      }else{
        setBadReportName(false)
        var data = {
          Bucket: "user-analysis-objs183943-staging",
          Key: location,
          Body: JSON.stringify(sentences),
          ContentEncoding: "base64",
          ContentType: "application/json",
          ACL: "public-read",
        };
        s3.putObject(data, function (err, data) {
          if (err) {
          } else {
            setSuccessfullUpload(true);
          }
        });
      }
    }
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
      setIsNeither(true);
    }
  }

  let handleSubmission = async () => {
      setIsAnalyzing(true);
      const audioUrl = await uploadFile(fileContent);
      const transcriptionResult = await transcribeFile(audioUrl);
      setSentences(transcriptionResult);
      setIsAnalyzing(false);
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

  const handleAddQuestion = (sentence, event) => {
    event.stopPropagation();
    /*
    if (!questions.some((question) => question.start === sentence.start)) {
      const newSentences = sentences.map((prevSentence) => {
        if (prevSentence.start === sentence.start) {
          return { ...prevSentence, isQuestion: true };
        }
        return prevSentence;
      });
      setSentences(newSentences);
    }
    */
    const newSentences = sentences.map((prevSentence) => {
      if (prevSentence.start === sentence.start) {
        return { ...prevSentence, label: "Uncategorized", isQuestion: true };
      }
      return prevSentence;
    });
    setSentences(newSentences);


  };

  function findQuestions() {
    let qs = [];
    if (sentences) {
      if (userReportToLoad) {
        for (let i = 0; i < userReportToLoad.length; i++) {
          if (userReportToLoad[i].isQuestion === true) {
            qs.push(userReportToLoad[i]);
          }
        }
        setQuestions(qs);
        findQuestionsLabels(qs);
        return qs;
      } else {
        //added so that not all question marks are identified as questions every time a question is added
        if (sentences.some((sentence) => sentence.isQuestion)) {
          for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].isQuestion == true) {
              qs.push(sentences[i]);
            } else {
              sentences[i].isQuestion = false;
              sentences[i].label = "non-question";
            }
          }
        }
        else {
          for (let i = 0; i < sentences.length; i++) {
            if (sentences[i].text.includes("?") || sentences[i].isQuestion == true) {
              qs.push(sentences[i]);
              sentences[i].isQuestion = true;
              sentences[i].label = "";
            } else {
              sentences[i].isQuestion = false;
              sentences[i].label = "non-question";
            }
          }
        }
        setQuestions(qs);
        findQuestionsLabels(qs);
        return qs;
      }
    }
  }

  function toResponse() {
    if (questions) {
      // const isQuestion = (sentence) => sentences.some((question) => question.isQuestion === sentence.isQuestion);
      const isQuestion = (sentence) => questions.some((question) => question.text === sentence.text);
      // console.log(isQuestion)

      let stamps = sentences.reduce((acc, current, index, arr) => {
        const isCurrentQuestion = isQuestion(current);
        const isNextNonQuestionAndDifferentSpeaker =
          index < arr.length - 1 && !isQuestion(arr[index + 1]) && arr[index + 1].speaker !== current.speaker;

        if (isCurrentQuestion) {
          acc[current.end] = isNextNonQuestionAndDifferentSpeaker ? (arr[index + 1].start - current.end) / 1000 : "No Response";
          //
          //
        }
        return acc;
      }, {});
      setRespTime(stamps);
    }
  }

  function printTimes() {
    if (questions) {
      let sStamps = [];
      let speaks = [];
      let qDur = 0;
      for (let i = 0; i < questions.length; i++) {
        qDur += questions[i].end - questions[i].start;
        sStamps.push(convertMsToTime(questions[i].start));
        speaks.push(questions[i].speaker);
      }
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
    //console.log("quests:")
    //console.log(quests)
    let labeled = [quests.length];
    const categoryMap = {
      Knowledge: knowledgeArray,
      Analyze: analyzeArray,
      Apply: applyArray,
      Create: createArray,
      Evaluate: evaluateArray,
      Understand: understandArray,
    };

    if (userReportToLoad) {
      labeled = userReportToLoad.filter(function (sentence) {
        if (sentence.label != "non-question") {
          return sentence.label;
        }
      });
      setLabeledQuestions(labeled);
    } else {
      const sanitizeWord = (word) => word.replace(/[.,/#!$%^&*;:{}=-_`~()]/g, "").replace(/\s{2,}/g, " ");

      const findCategories = (word) =>
        Object.keys(categoryMap)
          .filter((key) => categoryMap[key].includes(word))
          .join(" or ");

      if (sentences.some((sentence) => sentence.isQuestion && sentence.label !== "Uncategorized" && sentence.label !== "")) {
        labeled = quests.map((quest) => {
          if (quest.label !== "non-question") {
            return quest.label;
          }
        })
      }
      else {
        labeled = quests.map((quest) => {
          const words = quest.words.map((wordObj) => sanitizeWord(wordObj.text));
          for (const word of words) {
            const category = findCategories(word);
            if (category) {
              return category;
            }
          }
          return "Uncategorized";
        });
      }


      // newLabeledObj = sentences.filter(function(sentence){
      //   if(sentence.isQuestion === true){
      //     return sentence
      //   }
      // })

      for (let i = 0; i < quests.length; i++) {
        quests[i].label = labeled[i];
      }

      for (let j = 0; j < quests.length; j++) {
        for (let k = 0; k < sentences.length; k++) {
          if (quests[j].start == sentences[k].start) {
            sentences[k].label = quests[j].label;
          }
        }
      }
      //
      setLabeledQuestions(quests);
    }
  }



  function removeQuestion(idx) {
    let newSentences = [...sentences];
    let filteredQuestions = newSentences.filter(sentence => sentence.isQuestion);
    let questionIndex = newSentences.indexOf(filteredQuestions[idx]);
    if (questionIndex !== -1) {
      newSentences[questionIndex].isQuestion = false;
    }
    labeledQuestions.splice(idx, 1);
    times.splice(idx, 1);
    setQuestions(newSentences.filter(sentence => sentence.isQuestion));
  }

  function selectLabel(index, label) {
    let newLabeledQuestions = [...questions];
    console.log("select label index: ",index)
    newLabeledQuestions[index].label = label;
    console.log("new labeled questions:", newLabeledQuestions);
    setQuestions(newLabeledQuestions)
    setLabeledQuestions(newLabeledQuestions);

    for (let j = 0; j < questions.length; j++) {
      for (let k = 0; k < sentences.length; k++) {
        if (questions[j].start == sentences[k].start) {
          sentences[k].label = questions[j].label;
        }
      }
    }
  }

  function getAmountOfLabel(label) {
    let amount = 0;
    if (labeledQuestions) {
      for (let i = 0; i < labeledQuestions.length; i++) {
        if (labeledQuestions[i].label == label) {
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

  function setTimeChartData() {
    if (labeledQuestions) {
      let timeData = [];

      // Create a dictionary mapping labels to colors
      const labelColors = {
        Knowledge: "#0000FF",
        Understand: "#D42AC8",
        Apply: "#009400",
        Analyze: "#FF7300",
        Evaluate: "#FFC400",
        Create: "#7C7670",
      };

      // Calculate the total time range of the timeline
      const minTime = Math.min(...questions.map((q) => q.start / 1000));
      const maxTime = Math.max(...questions.map((q) => q.start / 1000));
      const totalTimeRange = maxTime - minTime;
      //

      // Define the percentage of the total time range to use as the constant width for the entries
      const entryWidthPercentage = 0.04; // Adjust this value as needed
      const constantWidth = totalTimeRange * entryWidthPercentage;

      for (let label in labelColors) {
        let initialEntry = {
          x: label,
          y: [0, 0],
          fillColor: labelColors[label],
        };
        timeData.push(initialEntry);
      }

      for (let i = 0; i < labeledQuestions.length; i++) {
        if (labelColors.hasOwnProperty(labeledQuestions[i].label)) {
          let entry = {
            x: labeledQuestions[i].label,
            y: [questions[i].start / 1000, questions[i].start / 1000 + constantWidth],
            fillColor: labelColors[labeledQuestions[i].label],
          };
          timeData.push(entry);
        }
      }
      return timeData;
    }
  }

  function setTimeLineData() {
    if (labeledQuestions) {
      let timeData = [];
      //console.log("sentences:")
      //console.log(sentences)
      const labelColors = {
        Knowledge: "#0000FF",
        Understand: "#D42AC8",
        Apply: "#009400",
        Analyze: "#FF7300",
        Evaluate: "#FFC400",
        Create: "#7C7670",
      };
      const categories = ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
      let questionList = sentences.filter(
        (item) => item.isQuestion && Object.keys(labelColors).includes(item.label)
      );
      //console.log("questionList");
      //console.log(questionList);
      const minTime = Math.min(...questions.map((q) => q.start / 1000));
      const maxTime = Math.max(...questions.map((q) => q.start / 1000));
      const totalTimeRange = maxTime - minTime;
      const entryWidthPercentage = 0.04; 
      const constantWidth = totalTimeRange * entryWidthPercentage;

      let initialEntry = {
        x: "Questions",
        y: [0, maxTime],
        fillColor: "#FFFFFF",
      };
      timeData.push(initialEntry);

      for (let i = 0; i < questionList.length; i++) {
        if (labelColors.hasOwnProperty(questionList[i].label)) {
          let endTime;
          if (i < questionList.length - 1) {
            endTime = Math.min(questionList[i + 1].start / 1000, questionList[i].start / 1000 + constantWidth);
          } else {
            endTime = questionList[i].start / 1000 + constantWidth;
          }
          let entry = {
            x: "Questions",
            y: [questionList[i].start / 1000, endTime],
            fillColor: labelColors[questionList[i].label],
          };
          timeData.push(entry);
        }
      }
      return timeData;
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

  const timeLineProps = {
    series: [
      {
        data: setTimeLineData(),
        name: 'Questions',
      },
    ],
    options: {
      chart: {
        type: "rangeBar",
      },
      title: {
        text: "Collapsed Timeline",
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
          distributed: true,
          dataLabels: {
            hideOverflowingLabels: false,
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      /*
      tooltip: {
        enabled: true,
        custom: function ({ series, seriesIndex, dataPointIndex, w }) {
          let question = sentences.filter(sentence => sentence.isQuestion)[dataPointIndex];
          return (
            '<div class="arrow_box">' +
            '<span><strong>Question: </strong>' + question.text + '</span>' +
            '</div>'
          );
        },
      },*/
      xaxis: {
        type: "numeric",
        distributed: true,
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "20px",
          },
        },
        categories: ["Questions"],
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
        categories: ["Knowledge", "Understand", "Apply", "Analyze", "Evaluate", "Create", "Uncategorized"],
      },
    },
    series: [
      {
        data: [
          {
            x: "Knowledge",
            y: getAmountOfLabel("Knowledge"),
            fillColor: "#0000FF",
            strokeColor: "#000000",
          },
          {
            x: "Understand",
            y: getAmountOfLabel("Understand"),
            fillColor: "#D42AC8",
            strokeColor: "#C23829",
          },
          {
            x: "Apply",
            y: getAmountOfLabel("Apply"),
            fillColor: "#009400",
            strokeColor: "#C23829",
          },
          {
            x: "Analyze",
            y: getAmountOfLabel("Analyze"),
            fillColor: "#FF7300",
            strokeColor: "#C23829",
          },
          {
            x: "Evaluate",
            y: getAmountOfLabel("Evaluate"),
            fillColor: "#FFC400",
            strokeColor: "#000000",
          },
          {
            x: "Create",
            y: getAmountOfLabel("Create"),
            fillColor: "#7C7670",
            strokeColor: "#C23829",
          },
          {
            x: "Uncategorized",
            y: getAmountOfLabel("Uncategorized"),
            fillColor: "#FF0000",
            strokeColor: "#C23829",
          },
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

      let questionList = sentences.filter(sentence => sentence.isQuestion);
      let questionArray = new Array();
      for (let i = 0; i < questionList.length; i++) {
        questionArray[i] = new Array(questionList[i].text, questionList[i].label);
      }

      let y = 20;
      doc.setLineWidth(2);
      doc.text(200, (y = y + 30), "Your File Analysis Report");
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

  const handleItemClick = (sentence, speaker) => {
    handleRelabelSpeaker(sentence, speaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  };

  function handleRelabelSpeaker(sentence, newSpeaker) {
    const newSentences = sentences.map((prevSentence) => {
      if (prevSentence.start === sentence.start) {
        return { ...prevSentence, speaker: newSpeaker };
      }
      return prevSentence;
    });
    setSentences(newSentences);
  }

  const CustomToggle = ({ children, onClick }) => (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );

  const handleToggle = (event) => {
    if (show !== null) {
      event.stopPropagation();
    }
    setShow(null);
  };
  const handleClickOutside = (event) => {
    if (!event.target.closest(".dropdown")) {
      setShow(null);
    }
  };
  const handleAddNewSpeaker = (sentence) => {
    const newSpeaker = String.fromCharCode(Array.from(new Set(speakers)).length + 65); 
    console.log(newSpeaker)// Assuming speakers are uppercase letters starting from 'A'
    handleRelabelSpeaker(sentence, newSpeaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleChangeText = (sentence, event) => {
    const newSentences = sentences.map((prevSentence) => {
      if (prevSentence.start === sentence.start) {
        return { ...prevSentence, text: event.target.value };
      }
      return prevSentence;
    });
    setSentences(newSentences);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  };

  const removeSentence = (removedSentence) => {
    const updatedSentences = sentences.filter((sentence) => sentence.start !== removedSentence.start);
    setSentences(updatedSentences);
  };

  const handleAddNewSentence = (sentencePrior) => {
    const selectedIndex = sentences.findIndex((s) => s === sentencePrior);
    const newStart = Math.ceil(sentencePrior.start / 1000) * 1000;
    const newEnd = newStart + 1000;
    const newSentence = {
      start: newStart,
      end: newEnd,
      speaker: "A",
      label: "non-question",
      isQuestion: false,
      text: "",
    };
    const updatedSentences = [...sentences.slice(0, selectedIndex + 1), newSentence, ...sentences.slice(selectedIndex + 1)];
    setSentences(updatedSentences);
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function reloadPage() {
    navigate("/home");
    window.location.reload();
  }

  return (
    <div>
      <div>
        {userReportToLoad ? (
          <div>
            <h5>Current report: {userReportLocation.substring(userReportLocation.indexOf("/") + 1)}</h5>
            <button className="btn btn-primary" onClick={(e) => reloadPage(e)}>Upload New Recording</button>
          </div>
        ): null}
        {!userReportToLoad ? (
          <div>
            <label className="form-label" htmlFor="customFile">
              <h4>Please upload an audio or video recording for transcription</h4>
              <p>Accepted AUDIO file types: .mp3, .m4a, .aac, .oga, .ogg, .flac, .wav, .wv, .aiff</p>
              <p>Accepted VIDEO file types: .webm, .MTS, .M2TS, .TS, .mov, .mp2, .mp4, .m4v, .mxf</p>
            </label>
            <input type="file" className="form-control" id="customFile" onChange={handleFileChange} />
          </div>
        ) : null}
        {isAudio ? (
          <div>
            <p>Click "Submit" to begin file analysis</p>
            <audio controls id="audio-player">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
            </audio>
            {isAnalyzing ? (
              <div>
                <Spinner className="spinner" animation="border" role="status"></Spinner>
                <p>Analysis in progress...</p>
                <p>Please do not refresh or exit this screen during this time</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p></p>
        )}
        {isVideo ? (
          <div>
            <p>Click "Submit" to begin file analysis</p>
            <video controls id="video-player">
              <source src={URL.createObjectURL(selectedFile)} type={selectedFile.type} />
            </video>
            {isAnalyzing ? (
              <div>
                <Spinner className="spinner" animation="border" role="status"></Spinner>
                <p>Analysis in progress...</p>
                <p>Please do not refresh or exit this screen during this time</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p></p>
        )}
        {isNeither ? (
          <div>
            <p>Click "Submit" to begin file analysis</p>
            {isAnalyzing ? (
              <div>
                <Spinner className="spinner" animation="border" role="status"></Spinner>
                <p>Analysis in progress...</p>
                <p>Please do not refresh or exit this screen during this time</p>
              </div>
            ) : null}
          </div>
        ) : (
          <p></p>
        )}
        {!isAnalyzing && !sentences ? (
          <button type="button" className="btn btn-primary" id="submission-main" onClick={() => handleSubmission({ selectedFile })}>
            Analyze Recording
          </button>
        ) : isAnalyzing ? (
          <button type="button" className="btn btn-primary" id="submission-main" onClick={() => window.location.reload()}>
            Cancel
          </button>
        ) : null}
      </div>
      {sentences && (
        <div>
          <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
            <h1>Full Transcript</h1>
            <h4>Click on a sentence to make adjustments to "Questions" list</h4>
            <div className="lead" style={{ backgroundColor: "white" }}>
            {sentences.map((sentence) => (
                <div key={sentence.start} onClick={() => setShow(sentence.start)}>
                  <Dropdown show={show === sentence.start}>
                    <CustomToggle onClick={(event) => handleToggle(event)}>
                      <div className="sentence" style={{ backgroundColor: show === sentence.start ? "#F0F0F0" : "white" }}>
                        <div className="sentence-transcript">
                          <div className="transcript-time">{convertMsToTime(sentence.start)}</div>
                          <div className={`transcript-speaker speaker-${sentence.speaker}`}>Speaker {sentence.speaker}:</div>
                          {editing === sentence.start ? (
                            <input
                              className="edit-text"
                              type="text"
                              value={sentence.text}
                              onBlur={handleBlur}
                              onChange={(event) => handleChangeText(sentence, event)}
                              onKeyDown={(event) => handleKeyPress(event)}
                              autoFocus
                            />
                          ) : (
                            <div className="transcript-text">{sentence.text}</div>
                          )}
                        </div>
                      </div>
                    </CustomToggle>
                    <Dropdown.Menu style={{ backgroundColor: "#F0F0F0" }}>
                      {!isRelabelingSpeaker ? (
                        <div>
                          <Dropdown.Item
                            onClick={(event) => {
                              handleAddQuestion(sentence, event);
                              handleToggle(null);
                            }}
                          >
                            Add as a question
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => setIsRelabelingSpeaker(true)}>Relabel speaker</Dropdown.Item>
                          <Dropdown.Item onClick={() => setEditing(sentence.start)}>Edit sentence</Dropdown.Item>
                          <Dropdown.Item onClick={() => removeSentence(sentence)}>Remove sentence</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleAddNewSentence(sentence)}>Insert sentence after</Dropdown.Item>
                        </div>
                      ) : (
                        <div>
                          {Array.from(new Set(speakers.sort())).map((speaker) => (
                            <Dropdown.Item onClick={() => handleItemClick(sentence, speaker)}>{speaker}</Dropdown.Item>
                          ))}{" "}
                          <div onClick={() => handleAddNewSpeaker(sentence)}>
                            <Dropdown.Item>Label as new speaker</Dropdown.Item>
                          </div>
                        </div>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              ))}
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
                    {sentences &&
                        times &&
                        sentences
                          .filter(sentence => sentence.isQuestion === true)
                          .map((question, index) => (
                            <tr key={index} className="question">
                              <td>{times[index]}</td>
                              <td id="question-table-question" style={{color: question.label === "Uncategorized" ? "#ff0000": "#000000"}}>"{question.text}"</td>
                              <td className={`transcript-speaker speaker-${question.speaker}`}>{question.speaker}</td>
                              <td>
                                {respTime[question.end] < 1 ? "< 1 second" 
                                : respTime[question.end] === "No Response" ? "No Response" 
                                : respTime[question.end] + " seconds"}
                              </td>
                              <td style={{color: question.label === "Uncategorized" ? "#ff0000": "#000000"}}>{question.label}</td>
                              <td className="question-options">
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
                                <button
                                  type="button"
                                  class="btn btn-danger"
                                  onClick={() => removeQuestion(index)}
                                >
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
              <tr>
                <td>
                  <Chart options={timeLineProps.options} series={timeLineProps.series} type="rangeBar" height={200} width={1300} />
                </td>
              </tr>
            </div>
          </div>
          {!userReportToLoad ? (
              <input placeholder="Name this report" onChange={handleInputChange} id="name-report"></input>
            ): null}
            {badReportName ? (
              <div className="alert alert-danger">Please name your report before saving!</div>
            ): null}
          <div>
            {successfullUpload ? (
              <h6>File Save Success!!!</h6>
            ): null}
            <button class="btn btn-primary" onClick={() => generatePDF(transcript, sentences, questions)} type="primary" id="bottom-button">
              Download PDF
            </button>
            <button onClick={() => saveUserObject()} className='btn btn-primary' id="bottom-button2">
              SAVE REPORT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}