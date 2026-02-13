const { generateID } = require("../../utils/services");
const db = require("../database/db");
const { isAdmin } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../storage");

const getFolders = (req, res) => {
    const parentId = req.query.parent_id ?? null;
    const query = `SELECT * FROM folders
        WHERE parent_id ${parentId ? "= ?" : "IS NULL"} ORDER BY name COLLATE NOCASE ASC`;
    const param = parentId ? [parentId] : [];
    db.all(query, param, (err, rows) => {
        res.json(rows);
    });
};

const createFolder = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Admin only" });
    }

    const name = req.body.name;
    const parentId = req.body.parent_id == "null" ? null : req.body.parent_id;

    db.run("INSERT INTO folders (id, name, parent_id) VALUES (?, ?, ?)", [
        generateID("FOLDER"),
        name,
        parentId,
    ]);

    res.json({ message: "Folder created" });
};

const deleteFolder = (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Admin only" });
    }

    const folderId = req.params.id;
    db.all(
        "SELECT id FROM folders WHERE parent_id = ?",
        [folderId],
        (err, folders) => {
            db.all(
                "SELECT id, ext FROM files WHERE parent_id = ?",
                [folderId],
                (err, files) => {
                    files.forEach((file) => {
                        const filenameStorage = `${file.id}.${file.ext}`;
                        fs.unlinkSync(path.join(UPLOAD_DIR, filenameStorage));
                    });
                    db.run("DELETE FROM files WHERE parent_id = ?", [folderId]);
                },
            );

            folders.forEach((fol_1) => {}); // TODO buat jadi seluruh file dan folder ke hapus semua
            db.run("DELETE FROM folders WHERE parent_id = ?", [folderId]);
        },
    );

    db.run("DELETE FROM folders WHERE parent_id = ?", [folderId]);
    db.run("DELETE FROM folders WHERE id = ?", [folderId]);

    res.json({ message: "Folder created" });
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
};
