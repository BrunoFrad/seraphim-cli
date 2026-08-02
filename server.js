import * as http from "node:http";

const PORT = process.argv[2];

const server = http.createServer((req, res) => {
    res.setHeader("Content-Type", "aplication/json");

    if (req.url === "/" && req.method === "GET") {
        res.writeHead(200);
        res.end(JSON.stringify(
            { message: "Connected" }
            ));
    }
});

server.listen(PORT);