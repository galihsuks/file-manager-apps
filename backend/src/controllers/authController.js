const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateID } = require("../../utils/services");

const SECRET = process.env.JWT_SECRET; // nanti bisa pindah ke .env

const login = (req, res) => {
    const { username, password } = req.body;

    try {
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            async (err, admin) => {
                if (!admin) {
                    return res
                        .status(401)
                        .json({ message: "Invalid credentials" });
                }

                const match = await bcrypt.compare(password, admin.password);
                if (!match) {
                    return res
                        .status(401)
                        .json({ message: "Invalid credentials" });
                }

                const token = jwt.sign(
                    { id: admin.id, role: "admin" },
                    SECRET,
                    {
                        expiresIn: "1d",
                    },
                );

                res.json({ token, id: admin.id });
            },
        );
    } catch (error) {
        res.json({ message: error.message });
    }
};

const signup = (req, res) => {
    const { username, password, role, pass_role } = req.body; //role : 'admin', 'user'
    const idGenerated = generateID("U");

    try {
        if (role == "admin" && pass_role != "123456") {
            return res.status(403).json({ message: "Forbidden" });
        }

        db.get(
            "SELECT * FROM users WHERE username = ? COLLATE NOCASE",
            [username],
            (err, row) => {
                if (row) {
                    return res.json({
                        message: `Success get ${role}`,
                        id: row.id,
                        username: row.username,
                        role: row.role,
                    });
                }

                bcrypt.hash(password, 10, (err, hash) => {
                    try {
                        db.run(
                            "INSERT INTO users (id, username, password, role) VALUES (?,?,?,?)",
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
                });
            },
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const search = (req, res) => {
    try {
        const { username } = req.body;
        db.get(
            "SELECT * FROM users WHERE username = ?",
            [username],
            (err, user) => {
                res.json(user);
            },
        );
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    login,
    signup,
    search,
};
