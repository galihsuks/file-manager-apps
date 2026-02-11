const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "database.sqlite"));

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            owner TEXT,
            uploader_name TEXT,
            folder_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS folders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT
        )
    `);
});

module.exports = db;
