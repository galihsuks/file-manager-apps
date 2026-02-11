const bcrypt = require("bcrypt");
const db = require("./db");

const username = "admin";
const password = "admin123";

bcrypt.hash(password, 10, (err, hash) => {
    db.run("INSERT INTO admins (username, password) VALUES (?,?)", [
        username,
        hash,
    ]);
});
