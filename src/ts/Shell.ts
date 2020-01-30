import { IFS } from "./filesystem/IFS";
import { LocalFS } from "./filesystem/LocalFS";
import { ProgramNotFoundError } from "./program/ProgramNotFoundError";

export class Shell {
  public currentDirectory: string[];
  private fs: IFS;

  constructor() {
    this.fs = new LocalFS();
    this.currentDirectory = [this.fs.root.name];
  }

  public command(command: string): string {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(parsedCommand[0], parsedCommand.slice(1));
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
    for (program of this.fs.getPrograms()) {
      if (program.name === programName) {
        found = true;
        break;
      }
    }

    if (found) {
      console.debug(`Found matching program: "${program.name}"`);
      return program.run(this, this.fs, args);
    } else {
      throw new ProgramNotFoundError(`Could not find program "${programName}"`);
    }
  }
}
