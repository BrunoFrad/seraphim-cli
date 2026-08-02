import express from "express";

const PORT = process.argv[2];
const server = express()

server.get('/', (req, res) => {
    res.send("Server running");
});

server.listen(PORT);