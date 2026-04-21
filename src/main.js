import chalk from "chalk";
import express from "express";
import { config } from "./config.js";
import { startBot } from "./bot.js";
import { logRequests } from "./middleware.js";
const app = express();
app.use(logRequests);
app.get("/", (_, res) => {
    res.send("Salom! Bot ishlayapti 🚀");
});
app.get("/health", (_, res) => {
    res.json({ ok: true, service: "weather-bot" });
});
app.listen(config.port, () => {
    console.log(chalk.bold.blue("Server running on port"), config.port);
});
startBot().catch((error) => {
    console.error(chalk.bold.red("Botni ishga tushirishda xatolik:"), error);
    process.exit(1);
});
