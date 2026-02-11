const db = require("../database/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET; // nanti bisa pindah ke .env

const login = (req, res) => {
    const { username, password } = req.body;

    db.get(
        "SELECT * FROM admins WHERE username = ?",
        [username],
        async (err, admin) => {
            if (!admin) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const match = await bcrypt.compare(password, admin.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ id: admin.id, role: "admin" }, SECRET, {
                expiresIn: "1d",
            });

            res.json({ token });
        },
    );
};

module.exports = {
    login,
};
