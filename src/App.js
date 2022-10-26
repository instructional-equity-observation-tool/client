import React, { useState } from 'react';
import axios from 'axios';

function App(){
	
	const [selectedFile, setSelectedFile] = useState();
	const [transcript, setTranscript] = useState("");
	const [isSelected, setIsSelected] = useState(false);
	const endpoint = "http://localhost:5000/upload";

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
					setTranscript(res.data.text);
				});
		};

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
			{transcript ? (
				<div>
					<p>Transcript: "{transcript}"</p>
					<p>Sentences:</p>
					{transcript.replace(/([.?!])\s*(?=[A-Z])/g, "$1|").split("|").map((sentence) => <p>"{sentence}"</p>)}
				</div>
			) : null}
		</div>
	)
}

export default App;