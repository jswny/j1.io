import { History } from "history";
import { ExecutableNotFoundError } from "./errors/ExecutableNotFoundError";
import { IFS } from "./filesystem/IFS";

export class Shell {
  public currentDirectory: string[];
  private fs: IFS;

  constructor(fs: IFS) {
    this.fs = fs;
    this.currentDirectory = [this.fs.root.name];
  }

  public command(history: History, command: string): JSX.Element {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(history, parsedCommand[0], parsedCommand.slice(1));
  }

  private parseCommand(command: string): string[] {
    const parsed = command
      .trim()
      .split(" ");

    return parsed;
  }

  private runCommand(history: History, executableName: string, args: string[]) {
    let found = false;
    let executable = null;
    for (executable of this.fs.getExecutables()) {
      if (executable.name === executableName) {
        found = true;
        break;
      }
    }

    if (found) {
      console.debug(`Found matching executable: "${executable.name}"`);
      return executable.run(history, this, this.fs, args);
    } else {
      throw new ExecutableNotFoundError(`Could not find executable "${executableName}"`);
    }
  }
}
