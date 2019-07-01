import { IProgram } from "../IProgram";
import { Shell } from "../Shell";

export class Cd implements IProgram {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(shell: Shell, args: string[]) {
    const newDirectory = args[0];
    shell.currentDirectory = newDirectory;
    console.debug(`cd changed current directory to "${newDirectory}"`);
    return "";
  }
}
