import { Terminal } from "../components/Terminal";
import { Directory } from "../filesystem/Directory";
import { DirectoryNotFoundError } from "../filesystem/DirectoryNotFoundError";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IProgram } from "./IProgram";

export class Cd implements IProgram {
  public name: string;

  constructor() {
    this.name = "cd";
  }

  public run(shell: Shell, fs: IFS, args: string[]): string {
    let path: string[] = shell.currentDirectory;
    if (args.length === 0) {
      path = ["root"];
    } else {
      let newDirectory = args[0];
      newDirectory = this.trimTrailingSlashes(newDirectory);

      if (newDirectory === "..") {
        path = path.slice(0, path.length - 1);

        if (path.length === 0) {
          path = ["root"];
        }
      } else {
        path = Path.parseAndAdd(path, newDirectory);
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
      throw new DirectoryNotFoundError(`The node at "${Path.render(path)}" is not a directory`);
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
