import { Program } from "./Program";
import { ProgramNotFoundError } from "./ProgramNotFoundError";
import { Cd } from "./programs/Cd"

export class Shell {
  currentDirectory: string;
  programs: Array<Program>;
  
  constructor() {
    this.currentDirectory = "/";
    this.programs = [new Cd()];
  }

  command(command: string) {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(parsedCommand[0], parsedCommand.slice(1))
  }

  private parseCommand(command: string): string[] {
    const parsed = command
      .trim()
      .split(" ");

    return parsed;
  }

  private runCommand(programName: string, args: string[]) {
    let found = false;
    let program = null;
    for (let i = 0; i < this.programs.length; i++) {
      program = this.programs[i];
      if (program.name === programName) {
        found = true;
        console.debug(`Shell found matching program: "${program.name}"`);
        break;
      }
    }

    if (found) {
      return program.run(this, args);
    } else {
      throw new ProgramNotFoundError(`Could not find program "${programName}"`);
    }
  }
}