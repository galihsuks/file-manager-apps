const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "database.sqlite");

let db;
let SQL;

async function initDB() {
    const isDev = !app.isPackaged;

    SQL = await initSqlJs({
        locateFile: (file) => {
            if (isDev) {
                return path.join(
                    __dirname,
                    "../../../node_modules/sql.js/dist",
                    file,
                );
            } else {
                return path.join(
                    process.resourcesPath,
                    "node_modules/sql.js/dist",
                    file,
                );
            }
        },
    });

    // kalau file sudah ada → load
    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            filename TEXT,
            owner TEXT,
            ext TEXT,
            parent_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS folders (
            id TEXT PRIMARY KEY,
            name TEXT,
            parent_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            password TEXT,
            role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ✅ Cek apakah admin sudah ada
    const checkAdmin = db.exec(`
        SELECT id FROM users 
        WHERE username = 'admin' AND role = 'admin'
        LIMIT 1
    `);

    if (!checkAdmin.length || !checkAdmin[0].values.length) {
        db.run(
            `
            INSERT INTO users (id, username, password, role, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `,
            [
                "U1771052723505",
                "admin",
                "$2b$10$y1GYt4MDv96ijHFK8aXjv.MAw.7eFogul7CwSmBhwtM6H.fNJ7XVy",
                "admin",
            ],
        );

        console.log("Admin user created");
    }

    saveDB();
}

function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
}

function getDB() {
    return db;
}

module.exports = {
    initDB,
    getDB,
    saveDB,
};
