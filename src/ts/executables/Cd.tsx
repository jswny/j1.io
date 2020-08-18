import * as React from "react";

import { DirectoryNotFoundError } from "../errors/DirectoryNotFoundError";
import { VirtualDirectory } from "../filesystem/VirtualDirectory";
import { IVirtualFS } from "../filesystem/IVirtualFS";
import { VirtualPath } from "../filesystem/VirtualPath";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

export class Cd implements IExecutable {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IVirtualFS,
    args: string[]
  ): IExecutableOutput {
    let path: string[] = currentDirectory;
    if (args.length === 0) {
      path = [fs.root.name];
    } else {
      let newDirectory = args[0];
      newDirectory = this.trimTrailingSlashes(newDirectory);

      if (newDirectory === "..") {
        path = path.slice(0, path.length - 1);

        if (path.length === 0) {
          path = [fs.root.name];
        }
      } else {
        path = VirtualPath.parseAndAdd(path, newDirectory);
      }
    }

    console.debug("Attempting to validate requested directory change to:");
    console.debug(path);

    const node = fs.stat(path);

    if (node instanceof VirtualDirectory) {
      setCurrentDirectory(path);
      console.debug("Changed current directory to:");
      console.debug(path);
    } else {
      throw new DirectoryNotFoundError(
        `The node at "${VirtualPath.render(path)}" is not a directory`
      );
    }

    return {
      historyPath: null,
      output: <div></div>,
    };
  }

  private trimTrailingSlashes(path: string): string {
    if (path === "/") {
      return path;
    } else {
      return path.replace(new RegExp("/*$"), "");
    }
  }
}
