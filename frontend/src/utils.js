import { v4 as uuid } from "uuid";

export const getDeviceId = () => {
    let id = localStorage.getItem("device_id");
    if (!id) {
        id = uuid();
        localStorage.setItem("device_id", id);
    }
    return id;
};

export const getUserName = () => {
    let name = localStorage.getItem("uploader_name");

    if (!name) {
        name = prompt("Masukkan nama kamu:");
        localStorage.setItem("uploader_name", name);
    }

    return name;
};
