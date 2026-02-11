const express = require("express");
const router = express.Router();
const {
    getFiles,
    uploadFile,
    deleteFile,
} = require("../controllers/fileController");
const { login } = require("../controllers/authController");
const { getFolders, createFolder } = require("../controllers/folderController");

router.get("/files", getFiles);
router.delete("/files/:name", deleteFile);
router.post("/upload", uploadFile);

router.post("/login", login);

router.get("/folders", getFolders);
router.post("/folders", createFolder);

module.exports = router;
