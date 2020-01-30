import { Terminal } from "../components/Terminal";
import { Directory } from "../filesystem/Directory";
import { DirectoryNotFoundError } from "../filesystem/DirectoryNotFoundError";
import { IFS } from "../filesystem/IFS";
import { LocalFS } from "../filesystem/LocalFS";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Cd implements IProgram {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(shell: Shell, fs: IFS, args: string[]): string {
    let newDirectory = args[0];
    newDirectory = this.trimTrailingSlashes(newDirectory);

    let path: string[] = shell.currentDirectory;
    if (newDirectory === "..") {
      path = path.slice(0, path.length - 1);
    } else {
      const split: string[] = newDirectory.split("/");
      if (newDirectory === "/") {
        path = ["/"];
      } else if (newDirectory.charAt(0) === "/") {
        split[0] = "root";
        path = split;
      } else {
        path = path.concat(split);
      }
    }

    console.debug("Attempting to validate requested directory change to:");
    console.debug(path);

    const node = fs.stat(path);

    if (node instanceof Directory) {
      shell.currentDirectory = path;
      console.debug("Changed current directory to:");
      console.debug(path);
    } else {
      throw new DirectoryNotFoundError(`The node at "${Terminal.renderPath(path)}" is not a directory`);
    }

    return "";
  }

  private trimTrailingSlashes(path: string): string {
    if (path === "/") {
      return path;
    } else {
      return path.replace(new RegExp("/*$"), "");
    }
  }
}
