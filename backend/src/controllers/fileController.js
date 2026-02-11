const fs = require("fs");
const path = require("path");
const multer = require("multer");
const db = require("../database/db");
const { isAdmin } = require("../middleware/auth");

const UPLOAD_DIR = path.join(__dirname, "../../storage");

if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// config multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage }).single("file");

// upload
const uploadFile = (req, res) => {
    upload(req, res, function (err) {
        if (err) return res.status(500).json({ message: err.message });

        const folderId = req.body.folder_id;
        db.run(
            "INSERT INTO files (filename, owner, uploader_name, folder_id) VALUES (?, ?, ?, ?)",
            [
                req.file.originalname,
                req.headers["x-device-id"],
                req.headers["x-uploader-name"],
                folderId,
            ],
        );

        res.json({ message: "File uploaded" });
    });
};

// list
const getFiles = (req, res) => {
    const folderId = req.query.folder_id;

    db.all(
        "SELECT * FROM files WHERE folder_id = ? ORDER BY id DESC",
        [folderId],
        (err, rows) => {
            res.json(rows);
        },
    );
};

// delete
const deleteFile = (req, res) => {
    const deviceId = req.headers["x-device-id"];
    const filename = req.params.name;

    db.get(
        "SELECT * FROM files WHERE filename = ?",
        [filename],
        (err, file) => {
            if (!file) return res.status(404).json({ message: "Not found" });

            const admin = isAdmin(req);

            if (!admin && file.owner !== deviceId) {
                return res.status(403).json({ message: "Forbidden" });
            }

            fs.unlinkSync(path.join(UPLOAD_DIR, filename));
            db.run("DELETE FROM files WHERE filename = ?", [filename]);

            res.json({ message: "Deleted" });
        },
    );
};

module.exports = {
    uploadFile,
    getFiles,
    deleteFile,
};
