import * as React from "react";
import { Link } from "react-router-dom";

import { VirtualDirectory } from "../filesystem/VirtualDirectory";
import { VirtualFile } from "../filesystem/VirtualFile";
import { VirtualFileType } from "../filesystem/VirtualFileType";
import { IVirtualFS } from "../filesystem/IVirtualFS";
import { VirtualNode } from "../filesystem/VirtualNode";
import { VirtualPath } from "../filesystem/VirtualPath";
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
    fs: IVirtualFS,
    args: string[]
  ): IExecutableOutput {
    const output: JSX.Element[] = [];

    let path: string[];
    if (args.length === 0) {
      path = currentDirectory;
    } else {
      const argPath = args[0];
      path = VirtualPath.parseAndAdd(currentDirectory, argPath);
    }

    const children = fs.list(path);
    children.forEach((child, index) =>
      output.push(this.getNodeOuput(child, index, path, commandHandler))
    );

    return {
      historyPath: null,
      output: <div>{output}</div>,
    };
  }

  private getNodeOuput(
    node: VirtualNode,
    key: number,
    path: string[],
    commandHandler: (command: string) => void
  ): JSX.Element {
    let output: JSX.Element;

    if (node instanceof VirtualDirectory) {
      output = this.getClickableOutput(
        node,
        key,
        path,
        commandHandler,
        (n: VirtualNode) => n.name + "/"
      );
    } else {
      const file: VirtualFile = node;
      switch (file.type) {
        case VirtualFileType.PDF:
        case VirtualFileType.Markdown:
        case VirtualFileType.Gist: {
          output = this.getClickableOutput(
            node,
            key,
            path,
            commandHandler,
            (n: VirtualNode) => n.name
          );
          break;
        }
        case VirtualFileType.Link: {
          output = (
            <div key={key}>
              <a href={file.content}>{file.name}</a>
            </div>
          );
          break;
        }
        default: {
          output = <div key={key}>{file.name}</div>;
        }
      }
    }
    return output;
  }

  private getClickableOutput(
    node: VirtualNode,
    key: number,
    path: string[],
    commandHandler: (command: string) => void,
    outputContent: (node: VirtualNode) => string
  ): JSX.Element {
    const nodePath = path.slice(0);
    nodePath.push(node.name);
    const renderedNewPath = VirtualPath.render(nodePath);

    let baseCommand: string;
    if (node instanceof VirtualDirectory) {
      baseCommand = "cd";
    } else {
      baseCommand = "open";
    }

    return (
      <div key={key}>
        <Link
          to={renderedNewPath}
          onClick={(event) =>
            this.onNodeClick(
              event,
              commandHandler,
              renderedNewPath,
              baseCommand
            )
          }
        >
          {outputContent(node)}
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
