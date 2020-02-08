import * as React from "react";

import { Directory } from "../filesystem/Directory";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { IFS } from "../filesystem/IFS";
import { INode } from "../filesystem/INode";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";

export class Ls implements IExecutable {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(shell: Shell, fs: IFS, args: string[]): JSX.Element {
    const output: JSX.Element[] = [];

    let path: string[];
    if (args.length === 0) {
      path = shell.currentDirectory;
    } else {
      const argPath = args[0];
      path = Path.parseAndAdd(shell.currentDirectory, argPath);
    }

    const children = fs.list(path);
    children.forEach((child) => output.push(this.getNodeOuput(child)));

    return (
      <div>{ output }</div>
    );
  }

  private getNodeOuput(node: INode): JSX.Element {
    let output: JSX.Element;

    if (node instanceof Directory) {
      output = <div>{ node.name + "/" }</div>;
    } else {
      const file: File = node as File;
      switch (file.type) {
        case FileType.Link: {
          output = (
            <div>
              <a href={ file.content }>{ file.name }</a>
              </div>
          );
          break;
        }
        default: {
          output = <div>{ file.name }</div>;
        }
      }
    }
    return output;
  }
}
