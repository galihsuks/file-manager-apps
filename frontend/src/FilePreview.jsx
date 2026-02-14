import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";
import { FiDownload, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
import ExcelPreview from "./ExcelPreview";
import DocxPreview from "./DocPreview";
import TextPreview from "./TextPreview";

export default function FilePreviewModal({ file, onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [zoom, setZoom] = useState(1);

    const extension = file?.ext?.toLowerCase();
    const fileUrl = file?.url;

    if (!file) return null;

    const docExt = ["docx", "doc"];
    const imageExt = ["png", "jpg", "jpeg", "webp", "gif"];
    const pdfExt = ["pdf"];
    const videoExt = ["mp4", "webm", "mov"];
    const audioExt = ["mp3", "wav"];
    const excelExt = ["xls", "xlsx", "csv"];
    const txtExt = ["txt", "log", "env", "json"];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
            {/* HEADER */}
            <div className="flex justify-between items-center p-4 bg-black text-white">
                <div className="flex gap-4 items-center">
                    {imageExt.includes(extension) && (
                        <>
                            <button onClick={() => setZoom((z) => z + 0.2)}>
                                <FiZoomIn size={20} />
                            </button>
                            <button
                                onClick={() =>
                                    setZoom((z) => Math.max(0.5, z - 0.2))
                                }
                            >
                                <FiZoomOut size={20} />
                            </button>
                        </>
                    )}

                    <a
                        href={fileUrl}
                        download
                        className="flex items-center gap-1"
                    >
                        <FiDownload /> Download
                    </a>
                </div>

                <button onClick={onClose}>
                    <FiX size={24} />
                </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-auto bg-white flex justify-center items-center p-6">
                {loading && (
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
                )}

                {error && (
                    <div className="text-red-500 text-center">
                        Gagal memuat preview file.
                    </div>
                )}

                {!loading && !error && (
                    <>
                        {/* IMAGE */}
                        {imageExt.includes(extension) && (
                            <img
                                src={fileUrl}
                                alt="preview"
                                style={{ transform: `scale(${zoom})` }}
                                className="transition-transform duration-200"
                            />
                        )}

                        {/* PDF */}
                        {pdfExt.includes(extension) && (
                            <iframe
                                src={fileUrl}
                                className="w-full h-full"
                                title="PDF"
                            />
                        )}

                        {/* VIDEO */}
                        {videoExt.includes(extension) && (
                            <video controls className="max-h-full">
                                <source src={fileUrl} />
                            </video>
                        )}

                        {/* AUDIO */}
                        {audioExt.includes(extension) && (
                            <audio controls className="w-full">
                                <source src={fileUrl} />
                            </audio>
                        )}

                        {/* DOCX */}
                        {docExt.includes(extension) && (
                            <DocxPreview fileUrl={fileUrl} />
                        )}

                        {/* EXCEL */}
                        {excelExt.includes(extension) && (
                            <ExcelPreview fileUrl={fileUrl} />
                        )}

                        {/* TEXT */}
                        {txtExt.includes(extension) && (
                            <TextPreview fileUrl={fileUrl} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
