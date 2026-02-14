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

const deleteFolder = async (req, res) => {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Admin only" });
    }

    const folderId = req.params.id;

    try {
        await deleteFolderRecursive(folderId);
        res.json({ message: "Folder deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete folder" });
    }
};

const deleteFolderRecursive = (folderId) => {
    return new Promise((resolve, reject) => {
        // 1️⃣ Ambil semua file di folder ini
        db.all(
            "SELECT id, ext FROM files WHERE parent_id = ?",
            [folderId],
            (err, files) => {
                if (err) return reject(err);

                // Hapus file fisik
                files.forEach((file) => {
                    const filenameStorage = `${file.id}.${file.ext}`;
                    const filePath = path.join(UPLOAD_DIR, filenameStorage);

                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                });

                // Hapus file dari DB
                db.run(
                    "DELETE FROM files WHERE parent_id = ?",
                    [folderId],
                    (err) => {
                        if (err) return reject(err);

                        // 2️⃣ Ambil subfolder
                        db.all(
                            "SELECT id FROM folders WHERE parent_id = ?",
                            [folderId],
                            async (err, folders) => {
                                if (err) return reject(err);

                                try {
                                    // Recursive delete subfolder
                                    for (const folder of folders) {
                                        await deleteFolderRecursive(folder.id);
                                    }

                                    // 3️⃣ Hapus folder ini
                                    db.run(
                                        "DELETE FROM folders WHERE id = ?",
                                        [folderId],
                                        (err) => {
                                            if (err) return reject(err);
                                            resolve();
                                        },
                                    );
                                } catch (e) {
                                    reject(e);
                                }
                            },
                        );
                    },
                );
            },
        );
    });
};

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
};
