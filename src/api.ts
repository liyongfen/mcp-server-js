import "dotenv/config";
import axios from "axios";

const API_KEY = process.env.OPENWEATHER_API_KEY
const USER_AGENT = process.env.OPENWEATHER_USER_AGENT

export async function getWeather(city: string) {
    try {
        const res: any = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
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
            const country = res.data?.sys?.country || '未知';
            const city = res.data?.name || '未知'
            const temp = res.data?.main?.temp || 'N/A';
            const humidity = res.data?.main?.humidity || 'N/A'; 
            const wind_speed = res.data?.wind?.speed || 'N/A'; 
            const description = res.data?.weather?.[0]?.description || 'A'; 
            return  `
                🌍 ${city}, ${country}
                 🌡 温度: ${temp}°C
                💧 湿度: ${humidity}%
                🌬 风速: ${wind_speed} m/s
                🌤 天气: ${description}
            `;
        }
        throw new Error(`HTTP error: ${res.status} ${res.statusText}`);
    } catch (error) {
        throw error;
    }
}