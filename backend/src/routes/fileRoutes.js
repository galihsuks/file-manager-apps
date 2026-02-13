const express = require("express");
const router = express.Router();
const {
    getFiles,
    uploadFile,
    deleteFile,
} = require("../controllers/fileController");
const { login, signup, search } = require("../controllers/authController");
const {
    getFolders,
    createFolder,
    deleteFolder,
} = require("../controllers/folderController");

router.get("/files", getFiles);
router.delete("/files/:id", deleteFile);
router.post("/upload", uploadFile);

router.post("/login", login);
router.post("/signup", signup);
router.post("/user/search", search);

router.get("/folders", getFolders);
router.post("/folders", createFolder);
router.delete("/folders/:id", deleteFolder);

module.exports = router;
