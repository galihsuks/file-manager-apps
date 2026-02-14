const { getDB } = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateID } = require("../../utils/services");

const SECRET = process.env.JWT_SECRET; // nanti bisa pindah ke .env

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = getDB();

        const result = db.exec("SELECT * FROM users WHERE username = ?", [
            username,
        ]);

        if (!result.length) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const columns = result[0].columns;
        const values = result[0].values[0];

        // convert row array → object
        const admin = Object.fromEntries(
            columns.map((col, i) => [col, values[i]]),
        );

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin.id, role: admin.role }, SECRET, {
            expiresIn: "1d",
        });

        res.json({ token, id: admin.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const signup = async (req, res) => {
    const { username, password, role, pass_role } = req.body;
    const idGenerated = generateID("U");

    try {
        const db = getDB();

        if (role === "admin" && pass_role !== "123456") {
            return res.status(403).json({ message: "Forbidden" });
        }

        // ✅ cek existing user (case insensitive)
        const result = db.exec(
            "SELECT * FROM users WHERE username = ? COLLATE NOCASE",
            [username],
        );

        if (result.length && result[0].values.length) {
            const { columns, values } = result[0];
            const existingUser = Object.fromEntries(
                columns.map((col, i) => [col, values[0][i]]),
            );

            return res.json({
                message: `Success get ${role}`,
                id: existingUser.id,
                username: existingUser.username,
                role: existingUser.role,
            });
        }

        // ✅ hash password
        const hash = await bcrypt.hash(password, 10);

        // ✅ insert user
        db.exec(
            "INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)",
            [idGenerated, username, hash, role],
        );

        res.json({
            message: `Success add ${role}`,
            id: idGenerated,
            username,
            role,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const search = (req, res) => {
    try {
        const { username } = req.body;
        const db = getDB();

        const result = db.exec("SELECT * FROM users WHERE username = ?", [
            username,
        ]);

        if (!result.length || !result[0].values.length) {
            return res.json(null);
        }

        const { columns, values } = result[0];

        const user = Object.fromEntries(
            columns.map((col, i) => [col, values[0][i]]),
        );

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    signup,
    search,
};
