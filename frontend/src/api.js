import axios from "axios";
import { getDeviceId } from "./utils.jsx";

const api = axios.create({
    baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }

    // 🔥 hanya inject kalau diset true
    if (config.requiresDeviceId) {
        const idDevice = await getDeviceId();
        config.headers["x-device-id"] = idDevice;
    }

    return config;
});

export default api;
