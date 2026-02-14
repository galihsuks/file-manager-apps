const express = require("express");
const cors = require("cors");
const path = require("path");

const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", fileRoutes);
app.use("/storage", express.static(path.join(__dirname, "../storage")));

app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

module.exports = app;
