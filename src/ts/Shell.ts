import { ExecutableNotFoundError } from "./errors/ExecutableNotFoundError";
import { IExecutableOutput } from "./executables/IExecutableOutput";
import { IVirtualFS } from "./filesystem/IVirtualFS";

export class Shell {
  private currentDirectory: string[];
  private fs: IVirtualFS;

  constructor(fs: IVirtualFS) {
    this.fs = fs;
    this.currentDirectory = [this.fs.root.name];
  }

  public command(
    commandHandler: (command: string) => void,
    command: string
  ): IExecutableOutput {
    const parsedCommand = this.parseCommand(command);
    return this.runCommand(
      commandHandler,
      parsedCommand[0],
      parsedCommand.slice(1)
    );
  }

  public setCurrentDirectory(path: string[]): void {
    this.currentDirectory = path.slice();
  }

  public getCurrentDirectoryCopy(): string[] {
    return this.currentDirectory.slice();
  }

  private parseCommand(command: string): string[] {
    const parsed = command.trim().split(" ");

    return parsed;
  }

  private runCommand(
    commandHandler: (command: string) => void,
    executableName: string,
    args: string[]
  ) {
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
      const setCurrentDirectory = (path: string[]) =>
        this.setCurrentDirectory(path);
      return executable.run(
        commandHandler,
        this.getCurrentDirectoryCopy(),
        setCurrentDirectory,
        this.fs,
        args
      );
    } else {
      throw new ExecutableNotFoundError(
        `Could not find executable "${executableName}"`
      );
    }
  }
}
