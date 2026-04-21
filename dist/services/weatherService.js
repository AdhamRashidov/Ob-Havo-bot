import axios from "axios";
import { config } from "../config.js";
import { normalizeCityQuery } from "../utils/format.js";
const weatherCodeMap = {
    0: "Ochiq osmon",
    1: "Asosan ochiq",
    2: "Qisman bulutli",
    3: "Bulutli",
    45: "Tuman",
    48: "Qalin tuman",
    51: "Yengil yomg'ir",
    53: "Yomg'ir",
    55: "Kuchli yomg'ir",
    56: "Yengil muzli yomg'ir",
    57: "Muzli yomg'ir",
    61: "Yengil yomg'ir",
    63: "Yomg'ir",
    65: "Kuchli yomg'ir",
    66: "Yengil muzli yomg'ir",
    67: "Kuchli muzli yomg'ir",
    71: "Yengil qor",
    73: "Qor",
    75: "Kuchli qor",
    77: "Qor donachalari",
    80: "Yengil jala",
    81: "Jala",
    82: "Kuchli jala",
    85: "Yengil qor jala",
    86: "Kuchli qor jala",
    95: "Momaqaldiroq",
    96: "Momaqaldiroq va do'l",
    99: "Kuchli momaqaldiroq va do'l"
};
function weatherDescription(code) {
    return weatherCodeMap[code] ?? "Ob-havo ma'lumoti mavjud";
}
function buildAliasList(city) {
    const aliases = new Set([city.name]);
    const localNames = city.local_names ?? {};
    for (const value of Object.values(localNames)) {
        aliases.add(value);
    }
    return Array.from(aliases);
}
export async function searchCities(cityQuery) {
    const normalized = normalizeCityQuery(cityQuery);
    const directResponse = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
        params: {
            q: normalized,
            limit: 8,
            appid: config.openWeatherApiKey
        }
    });
    const queryLower = normalized.toLocaleLowerCase();
    const enriched = directResponse.data.map((city) => {
        const aliases = buildAliasList(city);
        const aliasHit = aliases.some((name) => name.toLocaleLowerCase().includes(queryLower));
        return {
            city,
            aliases,
            score: aliasHit ? 2 : 1
        };
    });
    return enriched
        .sort((a, b) => b.score - a.score)
        .map(({ city }) => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon
    }));
}
export async function fetchWeeklyForecast(lat, lon) {
    const meteoResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
            latitude: lat,
            longitude: lon,
            timezone: "auto",
            forecast_days: 7,
            daily: "temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,weathercode,windspeed_10m_max"
        }
    });
    const daily = meteoResponse.data.daily;
    return daily.time.slice(0, 7).map((date, index) => ({
        date: `${date}T12:00:00.000Z`,
        minTemp: Math.round(daily.temperature_2m_min[index]),
        maxTemp: Math.round(daily.temperature_2m_max[index]),
        feelsLikeDay: Math.round(daily.apparent_temperature_max[index]),
        humidity: 0,
        windSpeed: Number((daily.windspeed_10m_max[index] / 3.6).toFixed(1)),
        pressure: 0,
        description: weatherDescription(daily.weathercode[index]),
        icon: "01d",
        pop: Math.round(daily.precipitation_probability_max[index] ?? 0)
    }));
}
