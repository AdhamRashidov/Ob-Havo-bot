import { randomUUID } from "node:crypto";
import { Markup, Telegraf } from "telegraf";
import chalk from "chalk";
import { config } from "./config.js";
import { fetchWeeklyForecast, searchCities } from "./services/weatherService.js";
import { getDayLabel, toPrettyDate } from "./utils/format.js";
const citySessions = new Map();
const forecastSessions = new Map();
const bot = new Telegraf(config.botToken);
function cityTitle(city) {
    const statePart = city.state ? `, ${city.state}` : "";
    return `${city.name}${statePart}, ${city.country}`;
}
function dayDetails(city, day, index) {
    const humidityLine = day.humidity > 0 ? `💧 Namlik: *${day.humidity}%*` : "💧 Namlik: *Ma'lumot yo'q*";
    const pressureLine = day.pressure > 0 ? `🔽 Bosim: *${day.pressure} hPa*` : "🔽 Bosim: *Ma'lumot yo'q*";
    return [
        `🌤 *${cityTitle(city)}*`,
        `📅 *${getDayLabel(day.date, index)}* (${toPrettyDate(day.date)})`,
        "",
        `🌡 Harorat: *${day.minTemp}°C ~ ${day.maxTemp}°C*`,
        `🤗 His etilish: *${day.feelsLikeDay}°C*`,
        humidityLine,
        `🌬 Shamol: *${day.windSpeed} m/s*`,
        pressureLine,
        `🌧 Yomg'ir ehtimoli: *${day.pop}%*`,
        `📝 Holat: _${day.description}_`
    ].join("\n");
}
bot.start((ctx) => ctx.reply([
    "Assalomu alaykum! 👋",
    "📍 Shahar nomini yuboring.",
    "Masalan: Toshkent, Tashkent, Москва"
].join("\n")));
bot.on("text", async (ctx) => {
    const query = ctx.message.text.trim();
    if (query.length < 2) {
        await ctx.reply("Shahar nomini biroz to'liqroq yozing 🙏");
        return;
    }
    await ctx.reply("🔎 Qidiryapman, biroz kuting...");
    try {
        const cities = await searchCities(query);
        if (!cities.length) {
            await ctx.reply("Bu nom bo'yicha shahar topilmadi. Iltimos, boshqa yozilishda urinib ko'ring.");
            return;
        }
        const sessionId = randomUUID().slice(0, 8);
        citySessions.set(sessionId, {
            userId: ctx.from.id,
            cities: cities.slice(0, 6)
        });
        const keyboard = cities.slice(0, 6).map((city, index) => Markup.button.callback(cityTitle(city), `pickcity:${sessionId}:${index}`));
        await ctx.reply("Quyidagi variantlardan mos shaharni tanlang 👇", Markup.inlineKeyboard(keyboard, { columns: 1 }));
    }
    catch (error) {
        console.error(chalk.red("Shahar qidirishda xatolik:"), error);
        await ctx.reply("Kechirasiz, qidiruvda xatolik bo'ldi. Birozdan keyin qayta urinib ko'ring.");
    }
});
bot.action(/pickcity:(.+):(\d+)/, async (ctx) => {
    const [, sessionId, indexText] = ctx.match;
    const citySession = citySessions.get(sessionId);
    if (!citySession || citySession.userId !== ctx.from.id) {
        await ctx.answerCbQuery("Bu tanlov muddati tugagan. Qaytadan shahar kiriting.");
        return;
    }
    const city = citySession.cities[Number(indexText)];
    if (!city) {
        await ctx.answerCbQuery("Shahar topilmadi.");
        return;
    }
    await ctx.answerCbQuery("Yuklanmoqda...");
    try {
        const forecast = await fetchWeeklyForecast(city.lat, city.lon);
        const forecastSessionId = randomUUID().slice(0, 8);
        forecastSessions.set(forecastSessionId, {
            userId: ctx.from.id,
            city,
            forecast
        });
        const buttons = forecast.map((day, index) => Markup.button.callback(`${getDayLabel(day.date, index)} • ${toPrettyDate(day.date).slice(0, 5)}`, `pickday:${forecastSessionId}:${index}`));
        await ctx.editMessageText([
            `✅ *${cityTitle(city)}* uchun 7 kunlik prognoz tayyor.`,
            "Kerakli kunni tanlang:"
        ].join("\n"), {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons, { columns: 2 })
        });
    }
    catch (error) {
        console.error(chalk.red("Prognoz olishda xatolik:"), error);
        await ctx.reply("Prognozni olishda muammo bo'ldi. Iltimos, boshqa shahar bilan urinib ko'ring.");
    }
});
bot.action(/pickday:(.+):(\d+)/, async (ctx) => {
    const [, forecastSessionId, dayIndexText] = ctx.match;
    const session = forecastSessions.get(forecastSessionId);
    const dayIndex = Number(dayIndexText);
    if (!session || session.userId !== ctx.from.id) {
        await ctx.answerCbQuery("Sessiya muddati tugagan. Qayta qidiruv qiling.");
        return;
    }
    const selectedDay = session.forecast[dayIndex];
    if (!selectedDay) {
        await ctx.answerCbQuery("Kun topilmadi.");
        return;
    }
    await ctx.answerCbQuery("Tayyor ✅");
    await ctx.reply(dayDetails(session.city, selectedDay, dayIndex), {
        parse_mode: "Markdown"
    });
});
export async function startBot() {
    await bot.launch();
    console.log(chalk.bold.cyan("Bot ishga tushdi 🤝"));
}
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
