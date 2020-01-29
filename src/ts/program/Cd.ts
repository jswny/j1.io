import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Cd implements IProgram {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(shell: Shell, args: string[]): string {
    const newDirectory = args[0];
    shell.currentDirectory = newDirectory;
    console.debug(`cd changed current directory to "${newDirectory}"`);
    return "";
  }
}
