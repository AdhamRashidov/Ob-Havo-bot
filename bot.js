import { Telegraf } from "telegraf";
import axios from "axios";
import chalk from "chalk";
import Request from './requestLog.js'

const bot = new Telegraf('8211897083:AAGEYY57G1hMLu1CHd75LzOXtsZGIo5xnis');

const API_KEY = 'b30d4a711e9d2006cd2a63b0e2f646af';

bot.start((ctx) => ctx.reply("Salom 👋. Ob-havo ma'lumotlarini bilmoqchimisiz? shahar nomini yozing."));

bot.on('text', async (ctx) => {
    const city = ctx.message.text.trim();
    const user = ctx.update.message.from;

    const createdUser = await Request.create({
        userId: user.id,
        userName: user.username,
        message: ctx.message.text.trim(),
        date: ctx.update.message.date
    });
    console.log(createdUser);

    try {
        const res = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=uz`
        );

        const data = res.data;
        const temp = data.main.temp;
        const desc = data.weather[0].description;

        ctx.reply(`${city} shahrida hozir ${temp}°C, ${desc}`);
    } catch (error) {
        ctx.reply("Uzur bunday shahar topilmadi 😕, yoki umuman mavjud emasmi 🤨");
    }
});

bot.launch();
console.log(chalk.bold.cyan('bot ishga tushdi 🤝'));