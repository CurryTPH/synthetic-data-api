const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./usage.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT,
    timestamp TEXT
  )`);
});

module.exports = db;