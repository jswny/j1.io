import { Program } from "../Program";
import { Shell } from "../Shell";

export class Cd implements Program {
  name: string;

  constructor() {
    this.name = "cd";
  }
  
  run(shell: Shell, args: string[]) {
    const newDirectory = args[0];
    shell.currentDirectory = newDirectory;
    console.debug(`cd changed current directory to "${newDirectory}"`);
    return "";
  }
}