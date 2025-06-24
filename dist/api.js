"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = getWeather;
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const API_KEY = process.env.OPENWEATHER_API_KEY;
const USER_AGENT = process.env.OPENWEATHER_USER_AGENT;
async function getWeather(city) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    try {
        const res = await axios_1.default.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                appid: API_KEY,
                q: city,
                units: 'metric',
                lang: 'zh_cn'
            },
            headers: {
                'User-Agent': USER_AGENT
            }
        });
        if (res.status === 200 && res.data.cod === 200) {
            const country = ((_b = (_a = res.data) === null || _a === void 0 ? void 0 : _a.sys) === null || _b === void 0 ? void 0 : _b.country) || '未知';
            const city = ((_c = res.data) === null || _c === void 0 ? void 0 : _c.name) || '未知';
            const temp = ((_e = (_d = res.data) === null || _d === void 0 ? void 0 : _d.main) === null || _e === void 0 ? void 0 : _e.temp) || 'N/A';
            const humidity = ((_g = (_f = res.data) === null || _f === void 0 ? void 0 : _f.main) === null || _g === void 0 ? void 0 : _g.humidity) || 'N/A';
            const wind_speed = ((_j = (_h = res.data) === null || _h === void 0 ? void 0 : _h.wind) === null || _j === void 0 ? void 0 : _j.speed) || 'N/A';
            const description = ((_m = (_l = (_k = res.data) === null || _k === void 0 ? void 0 : _k.weather) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.description) || 'A';
            return `
                🌍 ${city}, ${country}
                 🌡 温度: ${temp}°C
                💧 湿度: ${humidity}%
                🌬 风速: ${wind_speed} m/s
                🌤 天气: ${description}
            `;
        }
        throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    }
    catch (error) {
        throw error;
    }
}
