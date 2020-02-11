import * as React from "react";
import { Link } from "react-router-dom";

import { Terminal } from "../components/Terminal";
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

  public run(terminal: Terminal, shell: Shell, fs: IFS, args: string[]): IExecutableOutput {
    const output: JSX.Element[] = [];

    const currentDirectory: string[] = shell.getCurrentDirectoryCopy();

    let path: string[];
    if (args.length === 0) {
      path = currentDirectory;
    } else {
      const argPath = args[0];
      path = Path.parseAndAdd(currentDirectory, argPath);
    }

    const children = fs.list(path);
    children.forEach((child, index) => output.push(this.getNodeOuput(child, index, path, terminal)));

    return {
      historyPath: null,
      output: <div>{ output }</div>
    };
  }

  private getNodeOuput(node: INode, key: number, path: string[], terminal: Terminal): JSX.Element {
    let output: JSX.Element;

    if (node instanceof Directory) {
      output = <div key={ key }>{ node.name + "/" }</div>;
    } else {
      const file: File = node as File;
      switch (file.type) {
        case FileType.Gist: {
          const filePath = path.slice(0);
          filePath.push(file.name);
          const renderedNewPath = Path.render(filePath);
          console.debug(filePath);

          output = (
            <div key={ key }>
              <Link
                to={ renderedNewPath }
                onClick={ (event) => this.onFileClick(event, terminal, renderedNewPath) }
              >
                { file.name }
              </Link>
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

  private onFileClick(event: React.MouseEvent<HTMLAnchorElement>, terminal: Terminal, renderedFilePath: string): void {
    event.preventDefault();
    const command: string = `open ${renderedFilePath}`;
    console.debug(command)
    terminal.processCommand(command);
    // window.location.href = renderedNewPath;
    // event.preventDefault();
    // window.location.reload();
  }
}
