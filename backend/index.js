const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");

const refreshInterval = 5000;
const PORT = 5000;
const app = express();

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "c4c56ac5832249c1af9589d097463339",
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
});

app.use(
  fileUpload({
    useTempFiles: true,
    safeFileNames: true,
    preserveExtension: true,
    tempFileDir: `${__dirname}/public/files/temp`,
  })
);

app.use(cors());

app.get("/", (req, res) => {
  return res.status(200).send("It's working");
});

app.listen(PORT, () => {
  console.log("Server Running sucessfully.");
});

app.post("/upload", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  let file = req.files.file;

  fs.readFile(file.tempFilePath, (err, data) => {
    if (err) return console.error(err);

    assembly.post("/upload", data).then((response) => {
      console.log("RESPONSE: ", response);
      assembly
        .post("/transcript", {
          audio_url: response.data.upload_url,
          speaker_labels: true,
        })
        .then((response) => {
          // Interval for checking transcript completion
          const checkCompletionInterval = setInterval(async () => {
            const transcript = await assembly.get(`/transcript/${response.data.id}`);
            const transcriptStatus = transcript.data.status;

            if (transcriptStatus !== "completed") {
              console.log(`Transcript Status: ${transcriptStatus}`);
            } else if (transcriptStatus === "completed") {
              console.log(`Transcript Status: ${transcriptStatus}`);
              clearInterval(checkCompletionInterval);
              const sentences = await assembly.get(`/transcript/${response.data.id}/sentences`);
              return res.status(200).send(sentences.data);
            }
          }, refreshInterval);
        });
    });
  });
});
