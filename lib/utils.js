import pc from "picocolors";
import * as fs from "node:fs";
import { spawn } from "node:child_process";

export function serverUpHandler(options) {
    if (fs.existsSync("server.data")) {
        console.error(`\n${pc.bgRed(" ERROR ")} server already running`);
        return;
    }

    const child = spawn('node', ['server.js', options.port], {
        detached: true,
        stdio: 'ignore'
    });

    fs.writeFileSync("server.data", JSON.stringify({server: child.pid}));
    child.unref();

    console.log(`\n${pc.bgGreen(" SUCCESS ")} server started on port ${options.port}`);
}
export function serverDownHandler() {
    try {
        const file = fs.readFileSync("server.data").toString();
        const fileObject = JSON.parse(file);

        process.kill(fileObject.server);
        fs.unlinkSync("server.data");

        console.log(`\n${pc.bgGreen(" SUCCESS ")} server stopped`);
    } catch (error) {
        console.error(`\n${pc.bgRed(" ERROR ")} server is not running`);
    }
}