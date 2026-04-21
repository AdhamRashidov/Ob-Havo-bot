import "dotenv/config";
const requiredVars = ["BOT_TOKEN", "OPENWEATHER_API_KEY"];
for (const key of requiredVars) {
    if (!process.env[key]) {
        throw new Error(`Majburiy o'zgaruvchi topilmadi: ${key}`);
    }
}
export const config = {
    port: Number(process.env.PORT ?? 3000),
    botToken: process.env.BOT_TOKEN,
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY
};
