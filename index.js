import { Command } from "commander";

import {asciiLogo} from "./logo.js";
import {serverDownHandler, serverUpHandler} from "./utils.js";

const program = new Command();

program
    .name("seraphim")
    .description("A CLI for spamming and managing spyware")
    .version("\n\n" + asciiLogo + "\n\t\t\t\t\t\t\t\tVersion 0.0.1\n");

const serverCmd =
    program
        .command('server')
        .description("Manage the server");

serverCmd
    .command('up')
    .summary('start a server')
    .option("--port -p <string>", "port to bind the server", "3000")
    .action(serverUpHandler);

serverCmd
    .command('down')
    .summary('stop a server')
    .action(serverDownHandler);

program.parse(process.argv);