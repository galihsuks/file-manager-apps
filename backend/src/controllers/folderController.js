const { generateID } = require("../../utils/services");
const { getDB, saveDB } = require("../database/db");
const { isAdmin } = require("../middleware/auth");
const fs = require("fs");
const path = require("path");

const UPLOAD_DIR = path.join(__dirname, "../../storage");

const getFolders = (req, res) => {
    try {
        const db = getDB();
        const parentId = req.query.parent_id ?? null;

        let result;

        if (!parentId) {
            result = db.exec(`
                SELECT * FROM folders
                WHERE parent_id IS NULL
                ORDER BY name COLLATE NOCASE ASC
            `);
        } else {
            result = db.exec(
                `
                SELECT * FROM folders
                WHERE parent_id = ?
                ORDER BY name COLLATE NOCASE ASC
            `,
                [parentId],
            );
        }

        // kalau kosong
        if (!result.length) {
            return res.json([]);
        }

        const columns = result[0].columns;
        const values = result[0].values;

        // mapping jadi array object
        const rows = values.map((row) => {
            const obj = {};
            columns.forEach((col, i) => {
                obj[col] = row[i];
            });
            return obj;
        });

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createFolder = (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Admin only" });
        }

        const db = getDB();

        const name = req.body.name;
        const parentId =
            req.body.parent_id === "null" ? null : req.body.parent_id;

        const idGenerated = generateID("FOLDER");

        db.run(
            `
            INSERT INTO folders (id, name, parent_id) 
            VALUES (?, ?, ?)
            `,
            [idGenerated, name, parentId],
        );

        res.json({
            message: "Folder created",
            id: idGenerated,
            name,
            parent_id: parentId,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteFolder = (req, res) => {
    try {
        if (!isAdmin(req)) {
            return res.status(403).json({ message: "Admin only" });
        }

        const db = getDB();
        const folderId = req.params.id;

        deleteFolderRecursive(db, folderId);

        res.json({ message: "Folder deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete folder" });
    }
};

function deleteFolderRecursive(db, id) {
    // 1️⃣ Ambil semua file di folder ini
    const fileResult = db.exec(
        "SELECT id, ext FROM files WHERE parent_id = ?",
        [id],
    );

    const files = fileResult.length
        ? fileResult[0].values.map((row) => ({
              id: row[0],
              ext: row[1],
          }))
        : [];

    // Hapus file fisik
    for (const file of files) {
        const filenameStorage = `${file.id}.${file.ext}`;
        const filePath = path.join(UPLOAD_DIR, filenameStorage);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // 2️⃣ Hapus file dari DB
    db.run("DELETE FROM files WHERE parent_id = ?", [id]);

    // 3️⃣ Ambil semua subfolder
    const folderResult = db.exec("SELECT id FROM folders WHERE parent_id = ?", [
        id,
    ]);

    const folders = folderResult.length
        ? folderResult[0].values.map((row) => row[0])
        : [];

    // Recursive delete subfolder
    for (const subId of folders) {
        deleteFolderRecursive(db, subId);
    }

    // 4️⃣ Hapus folder ini
    db.run("DELETE FROM folders WHERE id = ?", [id]);
}

module.exports = {
    getFolders,
    createFolder,
    deleteFolder,
};
