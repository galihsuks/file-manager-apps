const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

exports.isAdmin = (req) => {
    const auth = req.headers.authorization;
    if (!auth) return false;

    try {
        const token = auth.split(" ")[1];
        const decoded = jwt.verify(token, SECRET);
        return decoded.role === "admin";
    } catch {
        return false;
    }
};
