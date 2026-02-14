import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";

export default function DocxPreview({ fileUrl }) {
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fileUrl) return;

        let mounted = true;

        const loadDoc = async () => {
            try {
                setLoading(true);
                setError(false);

                const res = await fetch(fileUrl);
                const buffer = await res.arrayBuffer();

                if (!mounted) return;

                // Clear old content dulu
                containerRef.current.innerHTML = "";

                await renderAsync(buffer, containerRef.current);

                if (mounted) setLoading(false);
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadDoc();

        return () => {
            mounted = false;
        };
    }, [fileUrl]);

    return (
        <div className="relative bg-white rounded-lg shadow max-h-[70vh] overflow-auto">
            {/* LOADING OVERLAY */}
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-white/70 z-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex justify-center items-center text-red-500 bg-white z-10">
                    Gagal memuat file DOCX
                </div>
            )}

            {/* INI HARUS SELALU ADA */}
            <div ref={containerRef} className="p-6" />
        </div>
    );
}
