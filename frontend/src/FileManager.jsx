import { useEffect, useRef, useState } from "react";
import api from "./api";
import { RiFileAddLine, RiFolderAddLine } from "react-icons/ri";
import { FaRegUser } from "react-icons/fa";
import { TbHome2, TbLogout } from "react-icons/tb";
import {
    MdDeleteOutline,
    MdFolderOpen,
    MdOutlineFileDownload,
    MdOutlineImage,
} from "react-icons/md";
import {
    downloadFile,
    getDeviceId,
    IconGenerate,
    toJakartaPretty,
    useIsTouchDevice,
} from "./utils";
import Notif from "./Notif";
import FilePreviewModal from "./FilePreview";
import ConfirmModal from "./confirmModal";
import PromptModal from "./PromptModal";

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
    const isTouch = useIsTouchDevice();
    const [previewFile, setPreviewFile] = useState({
        show: false,
        filename: "",
        filenameOriginal: "",
        ext: "",
    });
    const [promptState, setPromptState] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {
            setPromptState({ ...promptState, open: false });
        },
    });
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: "",
        message: "",
        onConfirm: () => {},
        onCancel: () => {
            setConfirmState({ ...confirmState, open: false });
        },
    });

    useEffect(() => {
        const tokenLcalStor = localStorage.getItem("token");
        tokenRef.current = tokenLcalStor;

        const getDeviceIdLocal = getDeviceId();
        if (!getDeviceIdLocal) {
            setPromptState({
                ...promptState,
                open: true,
                title: "Login",
                message: "Masukkan nama user Anda:",
                onConfirm: (value) => {
                    if (value) {
                        (async () => {
                            const resSignup = await api.post("/signup", {
                                username: value,
                                password: "123456",
                                role: "user",
                            });
                            localStorage.setItem(
                                "device_id",
                                resSignup.data.id,
                            );
                            window.location.reload();
                        })();
                    }
                },
            });
        }
        setDeviceId(getDeviceIdLocal);
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
            if (error.response.status == 402) {
                setPromptState({
                    ...promptState,
                    open: true,
                    title: "Login",
                    message: "Masukkan nama user Anda:",
                    onConfirm: (value) => {
                        if (value) {
                            (async () => {
                                const resSignup = await api.post("/signup", {
                                    username: value,
                                    password: "123456",
                                    role: "user",
                                });
                                localStorage.setItem(
                                    "device_id",
                                    resSignup.data.id,
                                );
                                window.location.reload();
                            })();
                        }
                    },
                });
            }
            setNotif({
                teks: error.response.data.message,
                type: "danger",
                show: true,
            });
        }
    };

    const handleDelete = async (isFolder, name, id) => {
        const message = `Delete ${isFolder ? "folder" : "file"} ${name}?`;
        const title = `Konfirmasi Delete`;
        setConfirmState({
            ...confirmState,
            open: true,
            title,
            message,
            onConfirm: () => {
                (async () => {
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
                        confirmState.onCancel();
                        loadFiles(currentFolder);
                        loadFolders(currentFolder);
                    } catch (error) {
                        setNotif({
                            teks: error.response.data.message,
                            type: "danger",
                            show: true,
                        });
                    }
                })();
            },
        });
    };

    const isAdmin = !!localStorage.getItem("token");

    const createFolder = () => {
        setPromptState({
            ...promptState,
            open: true,
            title: "Add Folder",
            message: "Beri nama folder baru:",
            onConfirm: (value) => {
                if (value) {
                    (async () => {
                        try {
                            const resPostFolder = await api.post(
                                "/folders",
                                { name: value, parent_id: currentFolder },
                                {
                                    requiresDeviceId: true,
                                },
                            );

                            setNotif({
                                teks: resPostFolder.data.message,
                                type: "success",
                                show: true,
                            });
                            promptState.onCancel();
                            loadFolders(currentFolder);
                        } catch (error) {
                            setNotif({
                                teks: error.response.data.message,
                                type: "danger",
                                show: true,
                            });
                        }
                    })();
                }
            },
        });
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
        setHistory(arrNew);
        setCurrentFolder(id);
    };

    return (
        <>
            <ConfirmModal
                open={confirmState.open}
                title={confirmState.title}
                message={confirmState.message}
                onConfirm={confirmState.onConfirm}
                onCancel={confirmState.onCancel}
            />
            <PromptModal
                open={promptState.open}
                title={promptState.title}
                message={promptState.message}
                onConfirm={promptState.onConfirm}
                onCancel={promptState.onCancel}
            />
            {previewFile.show && (
                <FilePreviewModal
                    file={{
                        url: `${import.meta.env.VITE_DEV_ENV ? "http://localhost:3001" : ""}/storage/${previewFile.filename}`,
                        ext: previewFile.ext,
                        name: previewFile.filenameOriginal,
                    }}
                    onClose={() =>
                        setPreviewFile({ ...previewFile, show: false })
                    }
                />
            )}
            {notif.show && (
                <Notif
                    text={notif.teks}
                    type={notif.type}
                    onClose={() => setNotif({ ...notif, show: false })}
                />
            )}
            <div className="h-screen bg-gray-100 p-5 md:p-10 flex flex-col gap-4">
                <div className="w-full bg-white shadow rounded-xl px-6 py-5 flex gap-3 items-center justify-between">
                    <h1 className="text-2xl/6 font-bold text-gray-700">
                        Office File Manager
                    </h1>
                    <div className="flex items-stretch gap-2">
                        <label title="Upload File">
                            <div className="flex items-center gap-1 bg-gray-100 text-gray-700 hover:text-white cursor-pointer hover:bg-gray-700 text-sm px-3 py-2 rounded">
                                <RiFileAddLine size={20} />
                                <p className="hidden md:block">Upload File</p>
                            </div>
                            <input
                                className="hidden"
                                type="file"
                                onChange={handleUpload}
                            />
                        </label>
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
                    <div className="font-semibold mb-2 flex gap-2 items-center text-sm py-2 px-3 bg-gray-200 rounded-full overflow-x-auto no-scrollbar">
                        <span
                            onClick={() => {
                                setHistory([]);
                                setCurrentFolder(null);
                            }}
                            className="cursor-pointer hover:text-lime-600 text-gray-700"
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
                                    className="cursor-pointer hover:text-lime-600 text-gray-700 text-xs md:text-sm text-nowrap"
                                >
                                    {h.name}
                                </span>
                            </div>
                        ))}
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="text-gray-300">
                                <th className="text-start font-semibold text-xs md:text-sm">
                                    <p className="py-2">Nama</p>
                                </th>
                                <th className="font-semibold text-xs md:text-sm">
                                    Pemilik
                                </th>
                                <th className="font-semibold text-xs md:text-sm">
                                    Tanggal
                                </th>
                                <th className="font-semibold text-xs md:text-sm">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {folders.map((f) => (
                                <tr
                                    key={f.id}
                                    onClick={
                                        isTouch
                                            ? () => openFolder(f)
                                            : undefined
                                    }
                                    onDoubleClick={
                                        !isTouch
                                            ? () => openFolder(f)
                                            : undefined
                                    }
                                    className="hover:bg-gray-50 cursor-default text-sm md:text-md text-gray-500"
                                >
                                    <td>
                                        <div className="flex gap-2 py-3 ps-0 md:ps-3 items-center">
                                            {IconGenerate("", true)}
                                            <p className="font-semibold text-nowrap truncate max-w-[100px] md:max-w-[400px] text-xs md:text-sm">
                                                {f.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td></td>
                                    <td className="text-center">
                                        <div className="flex gap-1 justify-center items-center">
                                            <p className="text-xs md:text-sm">
                                                {f.created_at
                                                    ? toJakartaPretty(
                                                          f.created_at,
                                                      ).split(",")[0]
                                                    : ""}
                                            </p>
                                            <p className="hidden md:block text-xs md:text-sm">
                                                {f.created_at
                                                    ? toJakartaPretty(
                                                          f.created_at,
                                                      ).split(",")[1]
                                                    : ""}
                                            </p>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex gap-2 items-center justify-center">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(
                                                            true,
                                                            f.name,
                                                            f.id,
                                                        );
                                                    }}
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
                                        onClick={() => {
                                            setPreviewFile({
                                                filename: `${file.id}.${file.ext}`,
                                                filenameOriginal: `${file.filename}`,
                                                ext: file.ext,
                                                show: true,
                                            });
                                        }}
                                        className="hover:bg-gray-50 cursor-default text-sm md:text-md text-gray-500"
                                    >
                                        <td>
                                            <div className="flex gap-2 py-3 ps-0 md:ps-3 items-center">
                                                {IconGenerate(file.ext, false)}
                                                <p className="font-semibold text-nowrap truncate max-w-[100px] md:max-w-[400px] text-xs md:text-sm">
                                                    {file.filename}
                                                </p>
                                            </div>
                                        </td>
                                        {mine ? (
                                            <td className="text-center text-nowrap text-lime-500 font-semibold px-3 py-1 rounded text-xs md:text-sm">
                                                Saya
                                            </td>
                                        ) : (
                                            <td className="text-center text-nowrap text-gray-400 px-2 py-1 rounded text-xs md:text-sm">
                                                {file.username}
                                            </td>
                                        )}
                                        <td className="text-center">
                                            <div className="flex gap-1 justify-center items-center">
                                                <p className="text-xs md:text-sm">
                                                    {file.created_at
                                                        ? toJakartaPretty(
                                                              file.created_at,
                                                          ).split(",")[0]
                                                        : ""}
                                                </p>
                                                <p className="hidden md:block text-xs md:text-sm">
                                                    {file.created_at
                                                        ? toJakartaPretty(
                                                              file.created_at,
                                                          ).split(",")[1]
                                                        : ""}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex gap-1 items-center justify-center">
                                                <div
                                                    title="Unduh"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        downloadFile(
                                                            file.filename,
                                                            `${import.meta.env.VITE_DEV_ENV ? "http://localhost:3001" : ""}/storage/${file.id}.${file.ext}`,
                                                        );
                                                    }}
                                                    className="cursor-pointer bg-lime-50 text-lime-600 hover:bg-lime-600 hover:text-lime-100 p-2 rounded"
                                                >
                                                    <MdOutlineFileDownload
                                                        size={15}
                                                    />
                                                </div>
                                                {(mine || isAdmin) && (
                                                    <div
                                                        title="Hapus"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(
                                                                false,
                                                                file.filename,
                                                                file.id,
                                                            );
                                                        }}
                                                        className="cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-rose-100 p-2 rounded"
                                                    >
                                                        <MdDeleteOutline
                                                            size={15}
                                                        />
                                                    </div>
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
                                        className="text-gray-300 text-center text-xs md:text-sm"
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
