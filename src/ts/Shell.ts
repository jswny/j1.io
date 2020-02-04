import { ExecutableNotFoundError } from "./executable/ExecutableNotFoundError";
import { IFS } from "./filesystem/IFS";
import { LocalFS } from "./filesystem/LocalFS";

export class Shell {
  public currentDirectory: string[];
  private fs: IFS;

  constructor() {
    this.fs = new LocalFS();
    this.currentDirectory = [this.fs.root.name];
  }

  public command(command: string): JSX.Element {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(parsedCommand[0], parsedCommand.slice(1));
  }

  private parseCommand(command: string): string[] {
    const parsed = command
      .trim()
      .split(" ");

    return parsed;
  }

  private runCommand(executableName: string, args: string[]) {
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
      return executable.run(this, this.fs, args);
    } else {
      throw new ExecutableNotFoundError(`Could not find executable "${executableName}"`);
    }
  }
}
