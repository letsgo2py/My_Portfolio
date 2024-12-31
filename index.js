const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { spawn } = require("node:child_process");


const app = express();
const PORT = 3000;


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false}))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
    res.render('home.ejs')
})

app.post('/chat', (req, res) => {
    const { query } = req.body;
    // Spawn a Python process to run the chatbot code
    const pythonProcess = spawn("python", ["chatbot.py", query]);

    let chatbotResponse = "";
    pythonProcess.stdout.on("data", (data) => {
        chatbotResponse += data.toString();
    });

    // Handle Python process exit
    pythonProcess.on("close", (code) => {
        if (code === 0) {
            // Send the chatbot's response back to the client
            res.json({ answer: chatbotResponse.trim() });
        } else {
            res.status(500).json({ error: "Error in chatbot execution." });
        }
    });

    // Handle Python process errors
    pythonProcess.on("error", (err) => {
        console.error("Error spawning Python process:", err);
        res.status(500).json({ error: "Internal server error." });
    });
})

app.listen(PORT, () =>{ console.log(`listening on port: ${PORT}`)})
