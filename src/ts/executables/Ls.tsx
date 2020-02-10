import * as React from "react";
import { generatePath } from "react-router";
import { Link } from "react-router-dom";

import { Directory } from "../filesystem/Directory";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { IFS } from "../filesystem/IFS";
import { INode } from "../filesystem/INode";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

export class Ls implements IExecutable {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(shell: Shell, fs: IFS, args: string[]): IExecutableOutput {
    const output: JSX.Element[] = [];

    let path: string[];
    if (args.length === 0) {
      path = shell.currentDirectory;
    } else {
      const argPath = args[0];
      path = Path.parseAndAdd(shell.currentDirectory, argPath);
    }

    const children = fs.list(path);
    children.forEach((child, index) => output.push(this.getNodeOuput(child, index, shell.currentDirectory)));

    return {
      historyPath: null,
      output: <div>{ output }</div>
    };
  }

  private getNodeOuput(node: INode, key: number, currentDirectory: string[]): JSX.Element {
    let output: JSX.Element;

    if (node instanceof Directory) {
      output = <div key={ key }>{ node.name + "/" }</div>;
    } else {
      const file: File = node as File;
      switch (file.type) {
        case FileType.Gist: {
          const newPath: string[] = currentDirectory.slice(0);
          newPath.push(file.name);
          const renderedNewPath: string = Path.render(newPath);

          output = (
            <div key={ key }>
              <Link to={ renderedNewPath }>{ file.name }</Link>
            </div>
          );
          break;
        }
        case FileType.Link: {
          output = (
            <div key={ key }>
              <a href={ file.content }>{ file.name }</a>
            </div>
          );
          break;
        }
        default: {
          output = <div key={ key }>{ file.name }</div>;
        }
      }
    }
    return output;
  }
}
