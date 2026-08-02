import { Command } from "commander";
import {asciiLogo} from "./logo.js";
import {addServerCommand} from "./commands.js";

const program = new Command();

program
    .name("seraphim")
    .description("A CLI for spamming and managing spyware")
    .version("\n\n" + asciiLogo + "\n\t\t\t\t\t\t\t\tVersion 0.0.1\n");

addServerCommand(program);

program.parse(process.argv);