import React, { useState } from 'react';
import axios from 'axios';

function App(){

	const [selectedFile, setSelectedFile] = useState();
	let [transcript, setTranscript] = useState(null);
	const [isSelected, setIsSelected] = useState(false);
	const endpoint = "http://localhost:5000/upload";

	//let transcript = null

	const handleFileChange = (event) => {
		setSelectedFile(event.target.files[0]);
		setIsSelected(true);
	};

	const handleSubmission = () => {
			const data = new FormData();
			data.append('file', selectedFile);
			axios.post(endpoint, data)
				.then((res) => {
					console.log(res);
					setTranscript(res.data.sentences);
				})
		};

	function getTranscript(){
		if(transcript != null){
			console.log("this is the transcript");
			console.log(transcript);
			return transcript;
		}
		setTimeout(getTranscript, 300);
	}

	function checkQuestion(sentence){
		if(sentence.includes("?")){
			console.log("sentence " + sentence + " passed");
			return true;
		}
		console.log("sentence: " + sentence + " failed")
		return false;
	}

	function filterQuestions(transcript){
		const questions = [];
		for(let i = 0; i < transcript.length; i++){
			if(checkQuestion(transcript[i].text)){
				questions.push(transcript[i].text);
			}
		}
		for(let i = 0; i < questions.length; i++) {
			console.log("questions: " + questions[i])
		}
		return questions;
	}

    //TODO: Label top speaker as Teacher
	function sumSpeakingTime(transcript){
		let totalTime = 0;
		for(let i = 0; i < transcript.length; i++){
			totalTime += (transcript[i].end - transcript[i].start);
		}
		return totalTime
	}

	function totalSpeakers(transcript) {
		let speakerList = [];
		for(let i = 0; i < transcript.length; i++){
			if(!(speakerList.includes(transcript[i].speaker))){
				speakerList.push(transcript[i].speaker);
			}
		}
		console.log("Speakers Detected: ");
		for(let i = 0; i < speakerList.length; i++) {
			console.log(speakerList[i]);
		}
		console.log("Total Speakers: " + speakerList.length);
		return speakerList;
	}

	function getSpeakingTime(speakerName){
		let speakingTime = 0;
		for(let i = 0; i < transcript.length; i++){
			if(transcript[i].speaker === speakerName){
				speakingTime += (transcript[i].end - transcript[i].start);
			}
		}
		return speakingTime;
	}


	return(
   		<div>
			<input type="file" name="file" onChange={handleFileChange} />
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
				<button onClick={handleSubmission}>Submit</button>
			</div>
			{getTranscript() ? (
				<div>
					<h1>Sentences</h1>
					<ul>
						{transcript.map(item => (
							<div>
								<h3>SPOKEN BY: Speaker {item.speaker}</h3>
								<h4>"{item.text}"</h4>
								<p>Timestamp: {Math.round((item.start/1000) * 100)/ 100} Seconds to {Math.round((item.end/1000) * 100)/ 100} Seconds</p>
								<p>Total Time: {Math.round((item.end/1000 - item.start/1000) * 100) / 100} Seconds</p>
								<p>__________________________________________</p>
							</div>
						))}
					</ul>
					<h2> Notable Questions </h2>

					<ul>
						{filterQuestions(transcript).map(item => (

							<li><h3>{item} </h3></li>
						))}
					</ul>
					<p>__________________________________________</p>
					<h2>Total File Time: {(Math.round((transcript[transcript.length-1].end/1000) * 100) / 100)} Seconds</h2>
					<h2>Total Speakers: {totalSpeakers(transcript).length}</h2>
					<h2>Total Speaking Time: {(Math.round((sumSpeakingTime(transcript)/1000) * 100) / 100) } Seconds</h2>
					{totalSpeakers(transcript).map(speaker => (
						<h3>Speaker {speaker} spoke {(Math.round((getSpeakingTime(speaker)/1000) * 100) / 100)} seconds</h3>
					))}
					<h2>Total Sentences: {transcript.length}</h2>
					<h2>Total Questions: {filterQuestions(transcript).length}</h2>
					<p>__________________________________________</p>
				</div>
			) : <p>no transcript</p> }
		</div>
	)
}

export default App;