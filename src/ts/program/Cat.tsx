import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Cat implements IProgram {
  public name: string;

  constructor() {
    this.name = "cat";
  }

  public run(shell: Shell, fs: IFS, args: string[]): JSX.Element {
    const argPath = args[0];
    const path: string[] = Path.parseAndAdd(shell.currentDirectory, argPath);
    const output = fs.read(path);

    return (
      <ReactMarkdown source={output} />
    );
  }
}
