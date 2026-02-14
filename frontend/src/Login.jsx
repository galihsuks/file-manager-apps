import { useState } from "react";
import api from "./api";
import { IoArrowBack } from "react-icons/io5";
import Notif from "./Notif";

export default function Login({ setWantLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [notif, setNotif] = useState({
        teks: "",
        type: "",
        show: false,
    });

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/login", { username, password });
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("device_id", res.data.id);
            setWantLogin(false);
        } catch (error) {
            setNotif({
                teks: error.response.data.message,
                type: "danger",
                show: true,
            });
        }
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
            <form onSubmit={submit}>
                <div className="h-screen flex items-center justify-center">
                    <div className="bg-white p-6 shadow rounded w-80">
                        <h1 className="text-xl font-bold mb-4 text-gray-700">
                            Admin Login
                        </h1>

                        <input
                            className="border p-2 w-full mb-3 text-sm rounded text-gray-700 border-gray-200 focus:outline-lime-700"
                            placeholder="Username"
                            spellCheck={false}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <input
                            type="password"
                            className="border p-2 w-full mb-3 text-sm rounded text-gray-700 border-gray-200 focus:outline-lime-700"
                            placeholder="Password"
                            spellCheck={false}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            type="submit"
                            className="bg-lime-100 mb-2 text-lime-700 hover:bg-lime-700 hover:text-white cursor-pointer font-semibold w-full py-2 rounded"
                        >
                            Login
                        </button>
                        <div
                            onClick={() => {
                                setWantLogin(false);
                            }}
                            className="text-lime-700 cursor-pointer flex gap-2 items-center justify-center"
                        >
                            <IoArrowBack size={15} />
                            <p>Kembali</p>
                        </div>
                    </div>
                </div>
            </form>
        </>
    );
}
