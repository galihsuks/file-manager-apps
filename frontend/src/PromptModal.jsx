import { useEffect, useState } from "react";

export default function PromptModal({
    open,
    title = "Input",
    message = "Masukkan sesuatu:",
    placeholder = "",
    confirmText = "OK",
    cancelText = "Batal",
    onConfirm,
    onCancel,
}) {
    const [value, setValue] = useState("");

    useEffect(() => {
        if (open) setValue("");
    }, [open]);

    useEffect(() => {
        const handleKey = (e) => {
            if (!open) return;
            if (e.key === "Escape") onCancel?.();
            if (e.key === "Enter") onConfirm?.(value);
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, value, onConfirm, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 animate-scaleIn">
                <h2 className="text-lg font-semibold mb-3">{title}</h2>
                <p className="text-gray-600 mb-3">{message}</p>

                <input
                    autoFocus
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-lime-400"
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => onCancel?.()}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => onConfirm?.(value)}
                        className="px-4 py-2 rounded-lg bg-lime-500 text-white hover:bg-lime-600"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
