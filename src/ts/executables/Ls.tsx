import * as React from "react";

import { Directory } from "../filesystem/Directory";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";

export class Ls implements IExecutable {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(shell: Shell, fs: IFS, args: string[]): JSX.Element {
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

    return (
      <div>{ output }</div>
    );
  }
}
