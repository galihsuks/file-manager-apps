import { useEffect, useState } from "react";

export default function TextPreview({ fileUrl }) {
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!fileUrl) return;

        let mounted = true;

        const loadText = async () => {
            try {
                setLoading(true);
                setError(false);

                const res = await fetch(fileUrl);
                const text = await res.text();

                if (mounted) {
                    setContent(text);
                    setLoading(false);
                }
            } catch (err) {
                console.error(err);
                if (mounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadText();

        return () => {
            mounted = false;
        };
    }, [fileUrl]);

    return (
        <div className="relative bg-gray-900 text-gray-100 rounded-lg max-h-[70vh] overflow-auto">
            {loading && (
                <div className="absolute inset-0 flex justify-center items-center bg-black/60">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex justify-center items-center text-red-400">
                    Gagal memuat file TXT
                </div>
            )}

            <pre className="p-6 whitespace-pre-wrap break-words font-mono text-sm">
                {content}
            </pre>
        </div>
    );
}
