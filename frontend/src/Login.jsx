import { useState } from "react";
import api from "./api";

export default function Login({ setWantLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/login", { username, password });
            localStorage.setItem("token", res.data.token);
            setWantLogin(false);
        } catch {
            alert("Login gagal");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("device_id");
        localStorage.removeItem("uploader_name");
        setWantLogin(false);
    };

    return (
        <form onSubmit={submit}>
            <div className="h-screen flex items-center justify-center">
                <div className="bg-white p-6 shadow rounded w-80">
                    <h1 className="text-xl font-bold mb-4">Admin Login</h1>

                    <input
                        className="border p-2 w-full mb-3"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                    />

                    <input
                        type="password"
                        className="border p-2 w-full mb-3"
                        placeholder="Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        className="bg-blue-500 text-white w-full py-2 rounded"
                    >
                        Login
                    </button>
                </div>
            </div>
        </form>
    );
}
