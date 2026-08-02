import { spawn } from "node:child_process";
import * as fs from "node:fs";
import { Command } from "commander";
import pc from "picocolors";
import {asciiLogo} from "./logo.js";

const program = new Command();

program
    .name("seraphim")
    .description("A CLI for spamming and managing spyware")
    .version("\n\n" + asciiLogo + "\n\t\t\t\t\t\t\t\tVersion 0.0.1\n");

// Server Handlers

const serverCmd =
    program
        .command('server')
        .description("Manage the server");

serverCmd
    .command('up')
    .summary('start a server')
    .option("--port -p <string>", "port to bind the server", "3000")
    .action((options) => {
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
    });

serverCmd
    .command('down')
    .summary('stop a server')
    .action(() => {
        try {
            const file = fs.readFileSync("server.data").toString();
            const fileObject = JSON.parse(file);

            process.kill(fileObject.server);
            fs.unlinkSync("server.data");

            console.log(`\n${pc.bgGreen(" SUCCESS ")} server stopped`);
        } catch (error) {
            console.error(`\n${pc.bgRed(" ERROR ")} server is not running`);
        }
    });

// End of Server Handlers

program.parse(process.argv);