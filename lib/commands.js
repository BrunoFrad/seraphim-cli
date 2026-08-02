import {serverDownHandler, serverUpHandler} from "./utils.js";

export function addServerCommand(program) {
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
}