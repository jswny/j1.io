import { DirectoryNotFoundError } from "../filesystem/DirectoryNotFoundError";
import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Cd implements IProgram {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(shell: Shell, fs: IFS, args: string[]): string {
    const newDirectory = args[0];

    let fullPath: string;
    if (newDirectory.charAt(0) === "/") {
      fullPath = newDirectory;
    } else if (shell.currentDirectory === "/") {
      fullPath = shell.currentDirectory + newDirectory;
    } else {
      fullPath = shell.currentDirectory + "/" + newDirectory;
    }

    console.debug(`Attempting to validate requested directory change to "${fullPath}"`);

    const result: boolean = fs.stat(fullPath);

    if (result) {
      shell.currentDirectory = fullPath;
      console.debug(`Changed current directory to "${fullPath}"`);
    } else {
      throw new DirectoryNotFoundError(`The directory "${fullPath}" does not exist`);
    }

    return "";
  }
}
