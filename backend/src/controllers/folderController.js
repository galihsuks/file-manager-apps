const db = require("../database/db");
const { isAdmin } = require("../middleware/auth");

const getFolders = (req, res) => {
    const parent = req.query.parent_id || null;

    db.all(
        "SELECT * FROM folders WHERE parent_id IS ?",
        [parent],
        (err, rows) => {
            res.json(rows);
        },
    );
};

const createFolder = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Admin only" });
    }

    const { name, parent_id } = req.body;

    db.run("INSERT INTO folders (name, parent_id) VALUES (?, ?)", [
        name,
        parent_id || null,
    ]);

    res.json({ message: "Folder created" });
};

module.exports = {
    getFolders,
    createFolder,
};
