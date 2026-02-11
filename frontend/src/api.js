import axios from "axios";
import { getDeviceId, getUserName } from "./utils";

const api = axios.create({
    baseURL: "http://192.168.1.8:3001/api",
});

api.interceptors.request.use((config) => {
    config.headers["x-device-id"] = getDeviceId();
    config.headers["x-uploader-name"] = getUserName();

    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }

    return config;
});

export default api;
