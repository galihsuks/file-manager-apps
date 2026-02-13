const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../database/db");
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
    db.get(
        "SELECT id FROM users WHERE id = ?",
        [req.headers["x-device-id"]],
        (err, row) => {
            if (err) {
                return res.status(500).json({ message: err.message });
            }

            if (!row) {
                return res.status(400).json({
                    message: "Device ID is not valid",
                });
            }

            upload(req, res, function (err) {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }

                const originalName = req.file.originalname;
                const idAndExt = req.file.filename.split(".");
                const filePath = req.file.path;
                const parentId =
                    req.body.parent_id == "null" ? null : req.body.parent_id;

                // 🔎 Optional: cek duplicate berdasarkan original filename + parent_id
                db.get(
                    "SELECT id FROM files WHERE filename = ? AND parent_id = ?",
                    [originalName, parentId],
                    (err, row) => {
                        if (err) {
                            deleteFileHelper(filePath);
                            return res
                                .status(500)
                                .json({ message: err.message });
                        }

                        if (row) {
                            deleteFileHelper(filePath);
                            return res.status(400).json({
                                message:
                                    "Gagal upload, filename sudah ada di folder ini",
                            });
                        }

                        // ✅ insert ke DB
                        db.run(
                            `INSERT INTO files 
                                (id, filename, owner, ext, parent_id) 
                                VALUES (?, ?, ?, ?, ?)`,
                            [
                                idAndExt[0],
                                originalName, // nama asli
                                req.headers["x-device-id"],
                                idAndExt[1],
                                parentId,
                            ],
                            function (err) {
                                if (err) {
                                    deleteFileHelper(filePath);
                                    return res.status(500).json({
                                        message: err.message,
                                    });
                                }

                                res.json({
                                    message: "File uploaded",
                                    id: idAndExt[0],
                                    filename: originalName,
                                    owner: req.headers["x-device-id"],
                                    ext: idAndExt[1],
                                    parent_id: parentId,
                                });
                            },
                        );
                    },
                );
            });
        },
    );
};

// list
const getFiles = (req, res) => {
    const parentId = req.query.parent_id ?? null;
    const query = `SELECT f.*, u.username
        FROM files AS f
        LEFT JOIN users AS u ON u.id = f.owner
        WHERE f.parent_id ${parentId ? "= ?" : "IS NULL"} ORDER BY f.filename COLLATE NOCASE ASC`;
    const param = parentId ? [parentId] : [];
    db.all(query, param, (err, rows) => {
        res.json(rows);
    });
};

// delete
const deleteFile = (req, res) => {
    const deviceId = req.headers["x-device-id"];
    const fileId = req.params.id;

    db.get("SELECT * FROM files WHERE id = ?", [fileId], (err, file) => {
        if (!file) return res.status(404).json({ message: "Not found" });

        const admin = isAdmin(req);

        if (!admin && file.owner !== deviceId) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const filenameStorage = `${file.id}.${file.ext}`;

        fs.unlinkSync(path.join(UPLOAD_DIR, filenameStorage));
        db.run("DELETE FROM files WHERE id = ?", [fileId]);

        res.json({ message: "Deleted success", file: filenameStorage });
    });
};

module.exports = {
    uploadFile,
    getFiles,
    deleteFile,
};
