import express from "express";
import connectDB from "./db.js";
import logRequests from "./middleware.js";
import chalk from "chalk";
import './bot.js';

const PORT = 3000;

const app = express();
connectDB();

app.use(logRequests);

app.get("/", (req, res) => {
    res.send("Salom! Bot ishlayapti 🚀");
});

app.listen(3000, () => console.log(chalk.bold.blue("Server running on port", PORT)));
