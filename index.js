import { Command } from "commander";
import {asciiLogo} from "./lib/logo.js";
import {addBuildCommand, addServerCommand, addStatusCommand} from "./lib/commands.js";

const program = new Command();

program
    .name("seraphim")
    .description("A CLI for spamming and managing spyware")
    .version("\n\n" + asciiLogo + "\n\t\t\t\t\t\t\t\tVersion 0.0.1\n");

addServerCommand(program);
addStatusCommand(program);
addBuildCommand(program);

program.parse(process.argv);