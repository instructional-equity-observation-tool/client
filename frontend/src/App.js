
import React, { useState } from 'react';
import axios from 'axios';
function App(){
    
    const [selectedFile, setSelectedFile] = useState();
    const [transcript, setTranscript] = useState("");
    const [sentences, setSentences] = useState("");
    const [questions, setQuestions] = useState("");
    const [numQuestions, setNumQuestions] = useState("");
    const [isSelected, setIsSelected] = useState(false);
    const endpoint = "http://localhost:5000/upload";


    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setIsSelected(true);
    };

    var handleSubmission = () => {
        const data = new FormData();
        data.append('file', selectedFile);
        axios.post(endpoint, data)
            .then((res) => {
                console.log(res);
                setSentences(res.data.sentences);
                createTranscript(res.data.sentences);
                findQuestions(res.data.sentences);
            })
    };

    function createTranscript(sentences){
        var transcript = "";
        for(let i = 0; i < sentences.length; i++){
            transcript += " " + sentences[i].text;
        }
        setTranscript(transcript);
        return transcript;
    }

    function findQuestions(sentences){
        var qs = [];
        for(let i = 0; i < sentences.length; i++){
            console.log(sentences[i].text.includes("?"));
            if(sentences[i].text.includes("?")){
                qs.push(sentences[i])
            }
        }
        setQuestions(qs);
        setNumQuestions(qs.length);
        return qs;
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
                        <button type="button" className="btn btn-primary" onClick={handleSubmission}>Submit</button>
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
                                            {questions.map((question) => 
                                            <ul className='nav justify-content-center border-bottom'>
                                                <li className='nav-item'>"{question.text}"</li>
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