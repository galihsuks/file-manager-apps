import { useEffect } from "react";

export default function ConfirmModal({
    open,
    title = "Konfirmasi",
    message = "Apakah kamu yakin?",
    confirmText = "Ya",
    cancelText = "Batal",
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        const handleKey = (e) => {
            if (!open) return;
            if (e.key === "Escape") onCancel?.();
            if (e.key === "Enter") onConfirm?.();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [open, onConfirm, onCancel]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-[90%] max-w-md rounded-2xl shadow-xl p-6 animate-scaleIn">
                <h2 className="text-lg font-semibold mb-3">{title}</h2>
                <p className="text-gray-600 mb-6">{message}</p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => onCancel?.()}
                        className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => onConfirm?.()}
                        className="px-4 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
