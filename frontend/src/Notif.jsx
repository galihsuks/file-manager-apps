import { useEffect, useState } from "react";

export default function Notif({
    text,
    type = "info",
    duration = 3000,
    onClose,
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Trigger masuk
        setTimeout(() => setVisible(true), 10);

        // Trigger keluar
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(() => {
                onClose && onClose();
            }, 300); // tunggu animasi selesai
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const typeStyles = {
        success: "bg-green-500",
        danger: "bg-red-500",
        info: "bg-blue-500",
    };

    return (
        <div
            className={`
                fixed bottom-5 right-5
                text-white px-6 py-3 rounded-xl shadow-lg
                transform transition-all duration-300 ease-in-out text-xs md:text-sm
                ${typeStyles[type]}
                ${visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
        >
            {text}
        </div>
    );
}
