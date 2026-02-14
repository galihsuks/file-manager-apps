const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { getDB, saveDB } = require("../database/db");
const { isAdmin } = require("../middleware/auth");
const { generateID } = require("../../utils/services");

const UPLOAD_DIR = path.join(__dirname, "../../storage");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// config multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uuid = generateID("FILE");
        cb(null, `${uuid}${ext}`);
    },
});

const upload = multer({ storage }).single("file");

const deleteFileHelper = (filePath) => {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

// upload
const uploadFile = (req, res) => {
    try {
        const db = getDB();

        // 🔎 1. Validasi device ID
        const deviceId = req.headers["x-device-id"] ?? "";

        const userResult = db.exec("SELECT id FROM users WHERE id = ?", [
            deviceId,
        ]);

        if (!userResult.length || !userResult[0].values.length) {
            return res.status(402).json({
                message: "Device ID is not valid",
            });
        }

        // 🔎 2. Upload file (multer)
        upload(req, res, function (err) {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            try {
                const originalName = req.file.originalname;
                const idAndExt = req.file.filename.split(".");
                const filePath = req.file.path;
                const parentId =
                    req.body.parent_id == "null" ? null : req.body.parent_id;

                // 🔎 3. Cek duplicate
                const duplicateResult = db.exec(
                    "SELECT id FROM files WHERE filename = ? AND parent_id IS ?",
                    [originalName, parentId],
                );

                if (
                    duplicateResult.length &&
                    duplicateResult[0].values.length
                ) {
                    deleteFileHelper(filePath);
                    return res.status(400).json({
                        message:
                            "Gagal upload, filename sudah ada di folder ini",
                    });
                }

                // ✅ 4. Insert ke database
                db.exec(
                    `INSERT INTO files 
                    (id, filename, owner, ext, parent_id) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        idAndExt[0],
                        originalName,
                        deviceId,
                        idAndExt[1],
                        parentId,
                    ],
                );

                // 💾 wajib save ke file (karena sql.js in-memory)
                saveDB();

                res.json({
                    message: "File uploaded",
                    id: idAndExt[0],
                    filename: originalName,
                    owner: deviceId,
                    ext: idAndExt[1],
                    parent_id: parentId,
                });
            } catch (error) {
                if (req.file?.path) {
                    deleteFileHelper(req.file.path);
                }
                res.status(500).json({ message: error.message });
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// list
const getFiles = (req, res) => {
    try {
        const db = getDB();
        const parentId = req.query.parent_id ?? null;

        let result;

        if (parentId) {
            result = db.exec(
                `
                SELECT f.*, u.username
                FROM files AS f
                LEFT JOIN users AS u ON u.id = f.owner
                WHERE f.parent_id = ?
                ORDER BY f.filename COLLATE NOCASE ASC
                `,
                [parentId],
            );
        } else {
            result = db.exec(
                `
                SELECT f.*, u.username
                FROM files AS f
                LEFT JOIN users AS u ON u.id = f.owner
                WHERE f.parent_id IS NULL
                ORDER BY f.filename COLLATE NOCASE ASC
                `,
            );
        }

        // 🔎 Kalau tidak ada data
        if (!result.length) {
            return res.json([]);
        }

        const columns = result[0].columns;
        const values = result[0].values;

        // 🧠 Mapping ke array object
        const rows = values.map((row) => {
            const obj = {};
            columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });

        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// delete
const deleteFile = (req, res) => {
    try {
        const db = getDB();
        const deviceId = req.headers["x-device-id"];
        const fileId = req.params.id;

        // 🔎 1. Ambil file
        const result = db.exec("SELECT * FROM files WHERE id = ?", [fileId]);

        if (!result.length) {
            return res.status(404).json({ message: "Not found" });
        }

        const columns = result[0].columns;
        const values = result[0].values;

        if (!values.length) {
            return res.status(404).json({ message: "Not found" });
        }

        // mapping ke object
        const file = {};
        columns.forEach((col, i) => {
            file[col] = values[0][i];
        });

        // 🔐 2. Cek permission
        const admin = isAdmin(req);

        if (!admin && file.owner !== deviceId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const filenameStorage = `${file.id}.${file.ext}`;
        const filePath = path.join(UPLOAD_DIR, filenameStorage);

        // 🗂️ 3. Hapus file fisik
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 🗑️ 4. Hapus dari database
        db.run("DELETE FROM files WHERE id = ?", [fileId]);

        // 💾 5. Simpan database ke file (PENTING di sql.js)
        saveDB();

        res.json({
            message: "Deleted success",
            file: filenameStorage,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadFile,
    getFiles,
    deleteFile,
};
