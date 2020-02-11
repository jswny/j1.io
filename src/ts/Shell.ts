import { Terminal } from "./components/Terminal";
import { ExecutableNotFoundError } from "./errors/ExecutableNotFoundError";
import { IExecutableOutput } from "./executables/IExecutableOutput";
import { IFS } from "./filesystem/IFS";

export class Shell {
  private currentDirectory: string[];
  private fs: IFS;

  constructor(fs: IFS) {
    this.fs = fs;
    this.currentDirectory = [this.fs.root.name];
  }

  public command(terminal: Terminal, command: string): IExecutableOutput {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(terminal, parsedCommand[0], parsedCommand.slice(1));
  }

  public setCurrentDirectory(path: string[]) {
    this.currentDirectory = path.slice();
  }

  public getCurrentDirectoryCopy() {
    return this.currentDirectory.slice();
  }

  private parseCommand(command: string): string[] {
    const parsed = command
      .trim()
      .split(" ");

    return parsed;
  }

  private runCommand(terminal: Terminal, executableName: string, args: string[]) {
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
      return executable.run(terminal, this, this.fs, args);
    } else {
      throw new ExecutableNotFoundError(`Could not find executable "${executableName}"`);
    }
  }
}
