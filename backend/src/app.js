const express = require("express");
const cors = require("cors");

const fileRoutes = require("./routes/fileRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", fileRoutes);
app.use("/storage", express.static("storage"));

module.exports = app;
