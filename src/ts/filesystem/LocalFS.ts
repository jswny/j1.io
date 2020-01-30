import * as manifest from "../../../dist/LocalFileManifest.json";
import { Cd } from "../program/Cd";
import { IProgram } from "../program/IProgram";
import { Ls } from "../program/Ls";
import { Directory } from "./Directory";
import { DirectoryNotFoundError } from "./DirectoryNotFoundError";
import { File } from "./File";
import { FileType } from "./FileType";
import { IFS } from "./IFS";
import { INode } from "./INode";
import { InvalidPathError } from "./InvalidPathError";

export class LocalFS implements IFS {
  private root: Directory;
  private programs: IProgram[];

  constructor() {
    console.debug("Loading filesystem manifest:");
    console.debug(manifest);

    this.root = this.build(manifest);
    this.root.name = "/";

    console.debug("Successfully loaded filesystem:");
    console.debug(this.root);

    const programsToLoad = [
      new Cd(),
      new Ls(),
    ];
    this.loadPrograms(programsToLoad);

    console.debug("Loaded programs:");
    console.debug(this.programs);
    console.debug("New filesystem:");
    console.debug(this.root);
  }

  public read(path: string): string {
    throw new Error("Method not implemented.");
  }

  public list(path: string): INode[] {
    const node: INode = this.stat(path);

    if (node instanceof Directory) {
      return (node as Directory).children;
    } else {
      throw new DirectoryNotFoundError(`The node at "${path}" is not a directory`);
    }
  }

  public stat(path: string): INode {
    let currNode: Directory = this.root;

    const split = path
      .split("/")
      .filter((elem) => elem !== "");

    for (let i = 0; i < split.length; i++) {
      const pathPart = split[i];
      let foundPathPart: boolean = false;

      for (const searchNode of currNode.children) {
        console.debug(`Searching for path part ${pathPart} in ${searchNode.name}`);

        if (i === split.length - 1 && searchNode.name === pathPart) {
          foundPathPart = true;
          return searchNode;
        } else if (searchNode instanceof Directory && searchNode.name === pathPart) {
          foundPathPart = true;
          currNode = searchNode;
        }
      }

      if (!foundPathPart) {
        throw new InvalidPathError(`The path "${path}" is invalid`);
      }
    }

    return currNode;
  }

  public getPrograms(): IProgram[] {
    return this.programs;
  }

  private build(jsonNode: any): Directory {
    const directory: Directory = new Directory(jsonNode.name);

    for (const child of jsonNode.children) {
      if ("children" in child) {
        directory.addChild(this.build(child));
      } else {
        const file: File = new File(child.name, child.type, child.content);
        directory.addChild(file);
      }
    }

    return directory;
  }

  private loadPrograms(programs: IProgram[]): void {
    this.programs = programs;

    const bin: Directory = new Directory("bin");

    for (const program of programs) {
      const programFile = new File(program.name, FileType.Executable, "");
      bin.addChild(program);
    }

    this.root.addChild(bin);
  }
}