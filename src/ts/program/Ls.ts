import { Directory } from "../filesystem/Directory";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Ls implements IProgram {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(shell: Shell, fs: IFS, args: string[]): string {
    let output: string = "";

    let path: string[];
    if (args.length === 0) {
      path = shell.currentDirectory;
    } else {
      const argPath = args[0];
      path = Path.parseAndAdd(shell.currentDirectory, argPath);
    }

    const children = fs.list(path);
    for (const child of children) {
      output += " " + (child instanceof Directory ? child.name + "/" : child.name);
    }

    output = output.trim();

    return output;
  }
}
