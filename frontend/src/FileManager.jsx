import { useEffect, useRef, useState } from "react";
import api from "./api";
import { RiFileAddLine, RiFolderAddLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { TbHome2, TbLogout } from "react-icons/tb";
import { MdDeleteOutline, MdFolderOpen, MdOutlineImage } from "react-icons/md";
import { getDeviceId, IconGenerate, toJakartaPretty } from "./utils";
import Notif from "./Notif";

export default function FileManager({ setWantLogin }) {
    const [folders, setFolders] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [history, setHistory] = useState([]);
    const tokenRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [deviceId, setDeviceId] = useState("");
    const [notif, setNotif] = useState({
        teks: "",
        type: "",
        show: false,
    });

    useEffect(() => {
        const tokenLcalStor = localStorage.getItem("token");
        tokenRef.current = tokenLcalStor;

        (async () => {
            const getDeviceIdLocal = await getDeviceId();
            setDeviceId(getDeviceIdLocal);
        })();
    }, []);

    const loadFolders = async (pId) => {
        const res = await api.get(`/folders?${pId ? `parent_id=${pId}` : ""}`);
        setFolders(res.data);
    };
    const loadFiles = async (pId) => {
        const res = await api.get(`/files?${pId ? `parent_id=${pId}` : ""}`);
        setFiles(res.data);
    };
    useEffect(() => {
        loadFolders(currentFolder);
        loadFiles(currentFolder);
    }, [currentFolder]);

    const openFolder = (folder) => {
        setHistory((prev) => [
            ...prev,
            {
                name: folder.name,
                id: folder.id,
            },
        ]);
        setCurrentFolder(folder.id);
    };

    const goBack = () => {
        const last = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setCurrentFolder(last);
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const form = new FormData();
        form.append("file", file);
        form.append("parent_id", currentFolder);

        try {
            const resultApiUpload = await api.post("/upload", form, {
                requiresDeviceId: true,
            });
            setNotif({
                teks: resultApiUpload.data.message,
                type: "success",
                show: true,
            });
            loadFiles(currentFolder);
        } catch (error) {
            setNotif({
                teks: error.response.data.message,
                type: "danger",
                show: true,
            });
        }
    };

    const handleDelete = async (isFolder, name, id) => {
        if (!confirm(`Delete ${isFolder ? "folder" : "file"} ${name}?`)) return;
        try {
            const responseDelete = await api.delete(
                `/${isFolder ? "folders" : "files"}/${id}`,
                {
                    requiresDeviceId: true,
                },
            );
            setNotif({
                teks: responseDelete.data.message,
                type: "success",
                show: true,
            });
            loadFiles(currentFolder);
            loadFolders(currentFolder);
        } catch (error) {
            setNotif({
                teks: error.response.data.message,
                type: "danger",
                show: true,
            });
        }
    };

    const isAdmin = !!localStorage.getItem("token");

    const createFolder = async () => {
        const name = prompt("Nama folder?");
        if (!name) return;

        try {
            const resPostFolder = await api.post(
                "/folders",
                { name, parent_id: currentFolder },
                {
                    requiresDeviceId: true,
                },
            );

            setNotif({
                teks: resPostFolder.data.message,
                type: "success",
                show: true,
            });
            loadFolders(currentFolder);
        } catch (error) {
            setNotif({
                teks: error.response.data.message,
                type: "danger",
                show: true,
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("device_id");
        localStorage.removeItem("uploader_name");
        setWantLogin(false);
        window.location.reload();
    };

    const handleClickBreadcrumb = (id, index) => {
        const arrNew = [...history];
        arrNew.splice(index + 1);
        console.log({
            arrNew,
            index,
        });
        setHistory(arrNew);
        setCurrentFolder(id);
    };

    return (
        <>
            {notif.show && (
                <Notif
                    text={notif.teks}
                    type={notif.type}
                    onClose={() => setNotif({ ...notif, show: false })}
                />
            )}
            <div className="h-screen bg-gray-100 p-5 md:p-10 flex flex-col gap-4">
                <div className="w-full bg-white shadow rounded-xl px-6 py-5 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-700">
                        Office File Manager
                    </h1>
                    <div className="flex items-stretch gap-2">
                        {deviceId && deviceId != "undefined" && (
                            <label title="Upload File">
                                <div className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:text-white cursor-pointer hover:bg-gray-700 text-sm px-3 py-2 rounded">
                                    <RiFileAddLine size={20} />
                                    <p className="hidden md:block">
                                        Upload File
                                    </p>
                                </div>
                                <input
                                    className="hidden"
                                    type="file"
                                    onChange={handleUpload}
                                />
                            </label>
                        )}
                        {isAdmin && (
                            <div
                                onClick={createFolder}
                                className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:text-white cursor-pointer hover:bg-gray-700 text-sm px-3 py-2 rounded"
                            >
                                <RiFolderAddLine size={20} />
                                <p className="hidden md:block">Add Folder</p>
                            </div>
                        )}
                        <div
                            onClick={() => {
                                if (tokenRef.current) {
                                    handleLogout();
                                } else {
                                    setWantLogin(true);
                                }
                            }}
                            className="flex items-center gap-1 bg-lime-100 text-lime-700 hover:text-white cursor-pointer hover:bg-lime-700 text-sm px-3 py-2 rounded"
                        >
                            {tokenRef.current ? (
                                <TbLogout size={15} />
                            ) : (
                                <FaRegUser size={15} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full bg-white shadow rounded-xl px-6 py-5">
                    <div className="font-semibold mb-2 flex gap-2 items-center text-sm py-2 px-3 bg-gray-50 rounded-full">
                        <span
                            onClick={() => {
                                setHistory([]);
                                setCurrentFolder(null);
                            }}
                            className="cursor-pointer hover:text-lime-600"
                        >
                            <TbHome2 size={17} />
                        </span>
                        {history.map((h, ind_h) => (
                            <div
                                key={ind_h}
                                className="flex gap-2 items-center"
                            >
                                <span className="text-gray-400">/</span>
                                <span
                                    onClick={() =>
                                        handleClickBreadcrumb(h.id, ind_h)
                                    }
                                    className="cursor-pointer hover:text-lime-600"
                                >
                                    {h.name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-300">
                                <th className="text-start font-semibold text-sm">
                                    <p className="py-2">Nama</p>
                                </th>
                                <th className="font-semibold text-sm">
                                    Pemilik
                                </th>
                                <th className="font-semibold text-sm">
                                    Tanggal
                                </th>
                                <th className="font-semibold text-sm">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {folders.map((f) => (
                                <tr
                                    key={f.id}
                                    onDoubleClick={() => openFolder(f)}
                                    className="hover:bg-gray-50 cursor-default text-sm md:text-md text-gray-500"
                                >
                                    <td>
                                        <div className="flex gap-2 py-3 ps-3">
                                            {IconGenerate("", true)}
                                            <p className="font-semibold text-nowrap truncate max-w-[100px] md:max-w-[400px]">
                                                {f.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td className="text-center">
                                        {toJakartaPretty(f.created_at)}
                                    </td>
                                    <td>
                                        <div className="flex gap-2 items-center justify-center">
                                            {isAdmin && (
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            true,
                                                            f.name,
                                                            f.id,
                                                        )
                                                    }
                                                    className="cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-rose-100 p-2 rounded"
                                                >
                                                    <MdDeleteOutline
                                                        size={15}
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {files.map((file) => {
                                const mine = file.owner === deviceId;
                                return (
                                    <tr
                                        key={file.id}
                                        className="hover:bg-gray-50 cursor-default text-sm md:text-md text-gray-500"
                                    >
                                        <td>
                                            <div className="flex gap-2 py-3 ps-3">
                                                {IconGenerate(file.ext, false)}
                                                <p className="font-semibold text-nowrap truncate max-w-[100px] md:max-w-[400px]">
                                                    {file.filename}
                                                </p>
                                            </div>
                                        </td>
                                        {mine ? (
                                            <td className="text-center text-nowrap text-lime-500 font-semibold px-2 py-1 rounded">
                                                Saya
                                            </td>
                                        ) : (
                                            <td className="text-center text-nowrap text-gray-400 px-2 py-1 rounded">
                                                {file.username}
                                            </td>
                                        )}
                                        <td className="text-center">
                                            {toJakartaPretty(file.created_at)}
                                        </td>
                                        <td>
                                            <div className="flex gap-2 items-center justify-center">
                                                {(mine || isAdmin) && (
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                false,
                                                                file.filename,
                                                                file.id,
                                                            )
                                                        }
                                                        className="cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-rose-100 p-2 rounded"
                                                    >
                                                        <MdDeleteOutline
                                                            size={15}
                                                        />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {files.length === 0 && folders.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-gray-300 text-center"
                                    >
                                        <i>No files or folders</i>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
