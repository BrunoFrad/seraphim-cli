import {handleKeyloggerDatabaseSearch, serverDownHandler, serverUpHandler, showStatusHandler} from "./utils.js";
import pc from "picocolors";
import * as fs from "node:fs";

export function addSearchCommand(program) {
    const logCmd =
        program
            .command('search')
            .summary("search on keylogger database")
            .action(handleKeyloggerDatabaseSearch)
}