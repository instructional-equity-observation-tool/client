import React, { useState } from 'react';
import axios from 'axios';
import { knowledgeArray } from './knowledge';
import { understandArray } from './understand';
import { applyArray } from './apply';
import { analyzeArray } from './analyze';
import { evaluateArray } from './evaluate';
import { createArray } from './create';

function App(){
    
    const [selectedFile, setSelectedFile] = useState();
    const [transcript, setTranscript] = useState("");
    const [sentences, setSentences] = useState("");
    const [times, setTimes] = useState("");
    const [questions, setQuestions] = useState("");
    const [numQuestions, setNumQuestions] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [labeledQuestions, setLabeledQuestions] = useState("");
    const endpoint = "http://localhost:5000/upload";




    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsSelected(true);
    };

    var handleSubmission = () => {
        if (isDisabled) {
            return;
        }
        setIsDisabled(true);
        const data = new FormData();
        data.append('file', selectedFile);
        axios.post(endpoint, data)
            .then((res) => {
                console.log(res);
                setSentences(res.data.sentences);
                createTranscript(res.data.sentences);
                findQuestions(res.data.sentences);
                printTimes(res.data.sentences);
            })
    };

    function createTranscript(sentences){
        var transcript = "";
        for(let i = 0; i < sentences.length; i++){
            transcript += " " + sentences[i].text;
        }
        setTranscript(transcript);
        setIsDisabled(false);
        return transcript;
    }

    function findQuestions(sentences){
        var qs = [];
        for(let i = 0; i < sentences.length; i++){
            if(sentences[i].text.includes("?")){
                qs.push(sentences[i])
            }
        }
        setQuestions(qs);
        setNumQuestions(qs.length);
        findQuestionsLabels(qs);
        return qs;
    }

    function printTimes(sentences){
        var sStamps = [];
        for(let i = 0; i < sentences.length; i++){
            console.log(sentences[i].text.includes("?"));
            if(sentences[i].text.includes("?")){

                sStamps.push(convertMsToTime(sentences[i].start))
            }
        }
        setTimes(sStamps)
        return sStamps
    }

    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
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
      
        return `${padTo2Digits(hours)}:${padTo2Digits(minutes)}:${padTo2Digits(
          seconds,
        )}`;
      }


      function findQuestionsLabels(quests){
            var labeled = [quests.length];
            for(let i = 0; i < quests.length; i++){
                if(knowledgeArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Knowledge';
                    }else{
                        labeled[i] += 'Knowledge';
                    }
                }else if(analyzeArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Analyze';
                    }else{
                        labeled[i] += 'Analyze';
                    }
                }else if(applyArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Apply';
                    }else{
                        labeled[i] += 'Apply';
                    }
                }else if(createArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Create';
                    }else{
                        labeled[i] += 'Create';
                    }
                }else if(evaluateArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Evaluate';
                    }else{
                        labeled[i] += 'Evaluate';
                    }
                }else if(understandArray.some(v => quests[i].text.includes(v))){
                    if(labeled[i] === undefined){
                        labeled[i] = 'Understand';
                    }else{
                        labeled[i] += 'Understand';
                    }
                }else{
                    labeled[i] = 'No Label';
                }
            }

            setLabeledQuestions(labeled);
            console.log(labeled);
            return labeled;
      }

    return(
        <div>
            <nav className="navbar navbar-expand-lg bg-dark">
                <a className="navbar-brand" href="#">
                    <img src="https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/2628.png" className="tcu-image" width="80" height="80" alt=""/>
                </a>

                <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <a className="nav-link text-light" href="#">About Us</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-light" href="#">IEOT</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-light" href="#">Contact Us</a>
                        </li>
                    </ul>
                </div>
            </nav>
        
            <div className='container' id='fileInputGroup'>
                <label className="form-label" htmlFor="customFile">Please Upload a File for Transcription</label>
                <input type="file" className="form-control" id="customFile" onChange={handleFileChange}/>
                    {isSelected ? (
                        <div>
                            <p>Filename: {selectedFile.name}</p>
                            <p>Filetype: {selectedFile.type}</p>
                            <p>Size in bytes: {selectedFile.size}</p>
                            <p>
                                lastModifiedDate:{' '}
                                {selectedFile.lastModifiedDate.toLocaleDateString()}
                            </p>
                        </div>
                    ) : (
                        <p>Select a file to show details</p>
                    )}
                    <div>
                        <button type="button" className="btn btn-primary" disabled={isDisabled} onClick={handleSubmission}>Submit</button>
                    </div>
                    {sentences ? (
                            <div>
                                <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
                                    <h1>Full Transcript</h1>
                                    <p className='lead'>
                                        {transcript}
                                    </p>
                                </div>
                                <div className="card-deck mb-3 text-center">
                                    <div className='card mb-4 box-shadow'>
                                        <div className='card-header'>
                                            <h2>Sentences</h2>
                                        </div>
                                        <div className='card-body'>
                                                {sentences.map((sentence) => 
                                                <ul className='nav justify-content-center border-bottom'>
                                                    <li className='nav-item'>"{sentence.text}"</li>
                                                </ul>
                                                )}
                                        </div>
                                    </div>
                                    <div className='card mb-4 box-shadow'>
                                        <div className='card-header'>
                                            <h2>Questions</h2>
                                        </div>
                                        <div className='card-body'>
                                            <div className="container">
                                                <div className="row">
                                                    <div className="col-sm">
                                                        {questions.map((question, index) => 
                                                            <ul className='row'>
                                                                <li className='col-sm'>"{question.text}"</li>
                                                                <li className='col-sm'>{times[index]}</li>
                                                                <li className='col-sm'>{labeledQuestions[index]}</li>
                                                            </ul>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='card mb-4 box-shadow'>
                                        <div className='card-header'>
                                            <h2>Question Timestamps</h2>
                                        </div>
                                        <div className='card-body'>
                                            {times.map((time) => 
                                            <ul className='nav justify-content-center border-bottom'>
                                                <li className='nav-item'>"{time}"</li>
                                            </ul>
                                            )}
                                        </div>
                                    </div>
                                    <div className='card mb-4 box-shadow'>
                                        <div className='card-header'>
                                            <h2>Number of Questions</h2>
                                        </div>
                                        <div className='card-body'>
                                            {numQuestions}
                                        </div>
                                    </div>
                                    {/* <div className='card mb-4 box-shadow'>
                                        <div className='card-header'>
                                            <h2>Labeled Questions</h2>
                                        </div>
                                        <div className='card-body'>
                                            {labeledQuestions.forEach((lq) => 
                                                <ul className='nav justify-content-center border-bottom'>
                                                    <li className='nav-item'>"{lq}"</li>
                                                </ul>
                                            )}
                                        </div>
                                    </div> */}
                                </div>

                            </div>
                        ) : null}   
                    



                    <footer className='py-3 my-4' id='footer'>
                        <ul className='nav justify-content-center border-bottom pb-3 mb-3'>
                            <li className='nav-item'> 
                                <a href='#' className='nav-link px-2 text-muted'>Home</a>
                            </li>
                            <li className='nav-item'> 
                                <a href='#' className='nav-link px-2 text-muted'>Features</a>
                            </li>
                            <li className='nav-item'> 
                                <a href='#' className='nav-link px-2 text-muted'>FAQs</a>
                            </li>
                            <li className='nav-item'> 
                                <a href='#' className='nav-link px-2 text-muted'>Pricing</a>
                            </li>
                        </ul>
                        <p className='text-center text-muted'>© 2022 Instructional Equity Observation Tool, Inc</p>
                    </footer>
                </div>
        </div>
    )
}

export default App;