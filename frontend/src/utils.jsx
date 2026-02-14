import api from "./api";
import {
    MdOutlineImage,
    MdPictureAsPdf,
    MdDescription,
    MdTableChart,
    MdAudiotrack,
    MdMovie,
    MdArchive,
    MdInsertDriveFile,
    MdFolder,
} from "react-icons/md";
import { useEffect, useState } from "react";

export function useIsTouchDevice() {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(pointer: coarse)");
        setIsTouch(mediaQuery.matches);

        const handler = (e) => setIsTouch(e.matches);
        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, []);

    return isTouch;
}

export function IconGenerate(ext, isFolder = false) {
    if (isFolder) {
        return <MdFolder size={18} className="text-yellow-500" />;
    }

    if (!ext) {
        return <MdInsertDriveFile size={18} className="text-gray-500" />;
    }

    const extension = ext.toLowerCase();

    const arrImg = ["png", "jpg", "jpeg", "webp", "gif"];
    const arrPdf = ["pdf"];
    const arrDoc = ["doc", "docx"];
    const arrExcel = ["xlsm", "xlsx", "xls", "xlsb", "csv"];
    const arrMusic = ["mp3", "wav"];
    const arrVideo = ["mp4", "mkv", "avi", "mov"];
    const arrZip = ["zip", "rar", "7z"];

    if (arrImg.includes(extension)) {
        return <MdOutlineImage size={18} className="text-blue-500" />;
    }

    if (arrPdf.includes(extension)) {
        return <MdPictureAsPdf size={18} className="text-red-500" />;
    }

    if (arrDoc.includes(extension)) {
        return <MdDescription size={18} className="text-blue-700" />;
    }

    if (arrExcel.includes(extension)) {
        return <MdTableChart size={18} className="text-green-600" />;
    }

    if (arrMusic.includes(extension)) {
        return <MdAudiotrack size={18} className="text-purple-500" />;
    }

    if (arrVideo.includes(extension)) {
        return <MdMovie size={18} className="text-pink-500" />;
    }

    if (arrZip.includes(extension)) {
        return <MdArchive size={18} className="text-orange-500" />;
    }

    return <MdInsertDriveFile size={18} className="text-gray-500" />;
}

export const getDeviceId = async () => {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId || deviceId == "undefined") {
        const q1 = prompt("Masukkan nama user kamu:");
        if (q1) {
            const resSignup = await api.post("/signup", {
                username: q1,
                password: "123456",
                role: "user",
            });
            localStorage.setItem("device_id", resSignup.data.id);
            deviceId = resSignup.data.id;
        }
    }
    return deviceId;
};

export function toJakartaTime(dateString, options = {}) {
    if (!dateString) return "-";

    // SQLite format → jadikan ISO UTC
    const utcDate = new Date(dateString.replace(" ", "T") + "Z");

    return utcDate.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        ...options,
    });
}

export function toJakartaPretty(dateString) {
    if (!dateString) return "-";

    const utcDate = new Date(dateString.replace(" ", "T") + "Z");

    const formatted = utcDate.toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

    return formatted + " WIB";
}
