import axios from "axios";
import { getDeviceId } from "./utils.jsx";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BE ?? ""}/api`,
});

api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }

    // 🔥 hanya inject kalau diset true
    if (config.requiresDeviceId) {
        const idDevice = getDeviceId();
        config.headers["x-device-id"] = idDevice;
    }

    return config;
});

export default api;
