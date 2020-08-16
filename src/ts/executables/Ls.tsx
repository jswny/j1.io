import * as React from "react";
import { Link } from "react-router-dom";

import { Directory } from "../filesystem/Directory";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { IFS } from "../filesystem/IFS";
import { INode } from "../filesystem/INode";
import { Path } from "../filesystem/Path";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

export class Ls implements IExecutable {
  public name: string;

  constructor() {
    this.name = "ls";
  }

  public run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IFS,
    args: string[]
  ): IExecutableOutput {
    const output: JSX.Element[] = [];

    let path: string[];
    if (args.length === 0) {
      path = currentDirectory;
    } else {
      const argPath = args[0];
      path = Path.parseAndAdd(currentDirectory, argPath);
    }

    const children = fs.list(path);
    children.forEach((child, index) => output.push(this.getNodeOuput(child, index, path, commandHandler)));

    return {
      historyPath: null,
      output: <div>{ output }</div>
    };
  }

  private getNodeOuput(
    node: INode,
    key: number,
    path: string[],
    commandHandler: (command: string) => void
  ): JSX.Element {
    let output: JSX.Element;

    if (node instanceof Directory) {
      output = this.getClickableOutput(node, key, path, commandHandler, (n: INode) => n.name + "/");
    } else {
      const file: File = node as File;
      switch (file.type) {
        case FileType.PDF:
        case FileType.Markdown:
        case FileType.Gist: {
          output = this.getClickableOutput(node, key, path, commandHandler, (n: INode) => n.name);
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

  private getClickableOutput(
    node: INode,
    key: number,
    path: string[],
    commandHandler: (command: string) => void,
    outputContent: (node: INode) => string
  ): JSX.Element {
    const nodePath = path.slice(0);
    nodePath.push(node.name);
    const renderedNewPath = Path.render(nodePath);

    let baseCommand: string;
    if (node instanceof Directory) {
      baseCommand = "cd";
    } else {
      baseCommand = "open";
    }

    return (
      <div key={ key }>
        <Link
          to={ renderedNewPath }
          onClick={ (event) => this.onNodeClick(event, commandHandler, renderedNewPath, baseCommand) }
        >
          { outputContent(node) }
        </Link>
      </div>
    );
  }

  private onNodeClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    commandHandler: (command: string) => void,
    renderedFilePath: string,
    baseCommand: string
  ): void {
    event.preventDefault();
    const command = `${baseCommand} ${renderedFilePath}`;
    commandHandler(command);
  }
}
