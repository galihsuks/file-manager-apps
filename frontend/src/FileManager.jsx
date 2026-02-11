import { useEffect, useState } from "react";
import api from "./api";
import { getDeviceId } from "./utils";

export default function FileManager() {
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [history, setHistory] = useState([]);

    const [files, setFiles] = useState([]);
    const deviceId = getDeviceId();

    const loadFolders = async () => {
        const res = await api.get(`/folders?parent_id=${currentFolder}`);
        console.log(res.data);
        setFolders(res.data);
    };

    useEffect(() => {
        loadFolders();
        loadFiles(currentFolder);
    }, [currentFolder]);

    const openFolder = (folder) => {
        setHistory([...history, currentFolder]);
        setCurrentFolder(folder.id);
    };

    const goBack = () => {
        const last = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setCurrentFolder(last);
    };

    const loadFiles = async (fid) => {
        if (!fid) return;
        const res = await api.get(`/files?folder_id=${fid}`);
        setFiles(res.data);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        form.append("folder_id", currentFolder);

        await api.post("/upload", form);
        loadFiles();
    };

    const handleDelete = async (name) => {
        if (!confirm("Delete file?")) return;
        await api.delete(`/files/${name}`);
        loadFiles();
    };

    const isAdmin = !!localStorage.getItem("token");

    const createFolder = async () => {
        const name = prompt("Nama folder?");
        if (!name) return;

        await api.post("/folders", { name, parent_id: currentFolder });
        loadFolders();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-10">
            <div className="max-w-4xl mx-auto bg-white shadow rounded-xl p-6">
                <h1 className="text-2xl font-bold mb-6">Office File Manager</h1>

                <input type="file" onChange={handleUpload} className="mb-6" />
                {isAdmin && <button onClick={createFolder}>+ Folder</button>}

                <div className="flex gap-2 flex-wrap">
                    {folders.map((f) => (
                        <div
                            key={f.id}
                            onClick={() => openFolder(f)}
                            className="cursor-pointer bg-yellow-100 px-3 py-2 rounded"
                        >
                            📁 {f.name}
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    {files.map((file) => {
                        const mine = file.owner === deviceId;

                        return (
                            <div
                                key={file.id}
                                className="flex items-center justify-between bg-gray-50 p-3 rounded"
                            >
                                <div className="flex items-center gap-3">
                                    <span>{file.filename}</span>
                                    <span className="text-xs text-gray-500">
                                        Upload oleh: {file.uploader_name || "-"}
                                    </span>
                                    {mine ? (
                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                                            Milik Saya
                                        </span>
                                    ) : (
                                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded">
                                            Orang Lain
                                        </span>
                                    )}
                                </div>

                                <div className="space-x-2">
                                    {/* delete */}
                                    {(mine || isAdmin) && (
                                        <button
                                            onClick={() =>
                                                handleDelete(file.filename)
                                            }
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {files.length === 0 && (
                        <div className="text-gray-500">No files</div>
                    )}
                </div>
            </div>
        </div>
    );
}
