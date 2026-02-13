import { useState } from "react";
import Login from "./Login";
import FileManager from "./FileManager";

export default function App() {
    const [wantLogin, setWantLogin] = useState(false);

    if (wantLogin) return <Login setWantLogin={setWantLogin} />;

    return <FileManager setWantLogin={setWantLogin} />;
}
