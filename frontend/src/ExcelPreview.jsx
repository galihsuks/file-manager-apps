import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function ExcelPreview({ fileUrl }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [sheets, setSheets] = useState([]);
    const [activeSheet, setActiveSheet] = useState("");
    const [sheetData, setSheetData] = useState([]);

    useEffect(() => {
        if (!fileUrl) return;

        setLoading(true);
        setError(false);

        fetch(fileUrl)
            .then((res) => res.arrayBuffer())
            .then((buffer) => {
                const workbook = XLSX.read(buffer, { type: "array" });

                setSheets(workbook.SheetNames);

                const firstSheet = workbook.SheetNames[0];
                setActiveSheet(firstSheet);

                const worksheet = workbook.Sheets[firstSheet];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    defval: "",
                });

                setSheetData(jsonData);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, [fileUrl]);

    const changeSheet = async (sheetName) => {
        setActiveSheet(sheetName);
        setLoading(true);

        try {
            const res = await fetch(fileUrl);
            const buffer = await res.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });

            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: "",
            });

            setSheetData(jsonData);
            setLoading(false);
        } catch (err) {
            setError(true);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500 text-center">
                Gagal memuat file Excel.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-4 h-full">
            {/* Sheet Tabs */}
            <div className="flex gap-2 border-b pb-2 overflow-x-auto">
                {sheets.map((sheet) => (
                    <button
                        key={sheet}
                        onClick={() => changeSheet(sheet)}
                        className={`px-3 py-1 text-sm rounded-t-lg transition text-nowrap ${
                            sheet === activeSheet
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 hover:bg-gray-300"
                        }`}
                    >
                        {sheet}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 border rounded-lg shadow">
                <table className="min-w-full text-sm border-collapse">
                    <tbody>
                        {sheetData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="even:bg-gray-50">
                                {row.map((cell, cellIndex) => (
                                    <td
                                        key={cellIndex}
                                        className="border px-3 py-2 whitespace-nowrap"
                                    >
                                        {cell}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
