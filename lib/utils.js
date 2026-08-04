import pc from "picocolors";
import * as fs from "node:fs";
import { spawn, exec } from "node:child_process";
import * as path from "node:path";

export function serverUpHandler(options) {
    if (fs.existsSync("server.data") && options.force === undefined) {
        console.error(`\n${pc.bgRed(" ERROR ")} server already running (--force to force creation)`);
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
export function showStatusHandler() {
    console.log(fs.existsSync("server.data") ?
        `${pc.green("   ")}server is running with PID ${JSON.parse(fs.readFileSync("server.data").toString()).server}` :
        `${pc.red("  ")}server isn't running!`
    );
    console.log(`${pc.blue("  ")}no email updates.`)
}
export function buildCommandHandler(targetPath) {
    fs.rmSync("./build", { recursive: true, force: true });
    fs.mkdirSync("build", {});
    fs.cpSync(`${targetPath}`, "./build/", {recursive: true});
    fs.copyFileSync("./seraphim.go", path.join("./build", path.basename("./seraphim.go")));
    exec("cd build && go mod init adsm/seraphim && go mod tidy && GOOS=windows go build -ldflags \"-H windowsgui\" seraphim.go", (err, stdout, stderr) => {
        if (err) {
            console.log(`${pc.bgRed(" ERROR ")} ${err.message}`);
        } else if (stdout) {
            console.log(`${pc.bgRed(" LOG ")} ${stdout}`);
        } else {
            console.log(`${pc.bgRed(" LOG ")} ${stderr}`);
        }
        console.log(`${pc.bgRed(" LOG ")} builded go module successfully`);
    });
}