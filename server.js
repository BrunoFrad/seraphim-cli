import express from "express";
import path from 'node:path'

const PORT = process.argv[2];
const server = express()

server.get('/download', (req, res) => {
    const caminho = path.join(
        process.cwd(),
        "public",
        "image.png"
    );

    res.download(caminho);
});

server.listen(PORT);