import { Directory } from "../filesystem/Directory";
import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Ls implements IProgram {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(shell: Shell, fs: IFS, args: string[]): string {
    let output: string = "";

    const children = fs.list(shell.currentDirectory);
    for (const child of children) {
      output += " " + (child instanceof Directory ? child.name + "/" : child.name);
    }

    output = output.trim();

    return output;
  }
}
