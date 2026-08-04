import express from "express";
import { Agent } from "node:http";
import path from 'node:path'

const PORT = process.argv[2];
const server = express()

server.get('/download', (req, res) => {
    const target = {
        ip: req.ip,
        useragent: req.get('User-Agent'),
        referer: req.get('Referer')
    };

    console.log(target);

    const caminho = path.join(
        process.cwd(),
        "public",
        "image.png"
    );

    res.download(caminho);
});

server.listen(PORT);