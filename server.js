import express from "express";

const PORT = process.argv[2];

const server = express()
server.use(express.json())

server.get('/', (req, res) => {
    res.send("Server running");
});

server.post('/', (req, res) => {
    res.status(200);
});

server.listen(PORT);