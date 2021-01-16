import * as React from "react";
import { Helmet } from "react-helmet";

import { ArgumentError } from "../errors/ArgumentError";
import { IVirtualFile } from "../filesystem/IVirtualFile";
import { IVirtualFS } from "../filesystem/IVirtualFS";
import { VirtualPath } from "../filesystem/VirtualPath";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

import "../../css/open.css";

export class Open implements IExecutable {
  public name: string;

  constructor() {
    this.name = "open";
  }

  public run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IVirtualFS,
    args: string[]
  ): IExecutableOutput {
    if (args.length === 0) {
      throw new ArgumentError(
        `Executable ${this.name} called with ${
          args.length
        } arguments, but at least ${1} required`
      );
    }

    let historyPath: string[] = null;

    const argPath = args[0];
    const path: string[] = VirtualPath.parseAndAdd(currentDirectory, argPath);
    const output = fs.read(path);
    const file: IVirtualFile = fs.stat(path) as IVirtualFile;

    const result: JSX.Element = file.open();
    historyPath = path;

    const resultWithTitle: JSX.Element = (
      <>
        <Helmet>
          <title>{file.name} - Joe Sweeney</title>
        </Helmet>
        {result}
      </>
    );

    return {
      historyPath,
      output: resultWithTitle,
    };
  }
}
