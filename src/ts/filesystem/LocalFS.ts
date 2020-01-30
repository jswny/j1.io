import * as manifest from "../../../dist/LocalFileManifest.json";
import { Cat } from "../program/Cat";
import { Cd } from "../program/Cd";
import { IProgram } from "../program/IProgram";
import { Ls } from "../program/Ls";
import { Directory } from "./Directory";
import { DirectoryNotFoundError } from "./DirectoryNotFoundError";
import { File } from "./File";
import { FileNotFoundError } from "./FileNotFoundError";
import { FileType } from "./FileType";
import { IFS } from "./IFS";
import { INode } from "./INode";
import { InvalidPathError } from "./InvalidPathError";
import { Path } from "./Path";

export class LocalFS implements IFS {
  public root: Directory;
  private programs: IProgram[];

  constructor() {
    console.debug("Loading filesystem manifest:");
    console.debug(manifest);

    this.root = this.build(manifest);
    this.root.name = "root";

    console.debug("Successfully loaded filesystem:");
    console.debug(this.root);

    const programsToLoad = [
      new Cd(),
      new Ls(),
      new Cat(),
    ];
    this.loadPrograms(programsToLoad);

    console.debug("Loaded programs:");
    console.debug(this.programs);
    console.debug("New filesystem:");
    console.debug(this.root);
  }

  public read(path: string[]): string {
    console.debug("Read requested for path:");
    console.debug(path);

    const node = this.stat(path);
    let output: string;

    if (node instanceof File) {
      const file: File = node;
      if (file.type === FileType.Markdown) {
        console.debug("Found compatible file to read: ");
        console.debug(file);

        output = file.content;
      } else {
        throw new FileNotFoundError(`The node at "${Path.render(path)}" is not a readable file`);
      }
    } else {
      throw new FileNotFoundError(`The node at "${Path.render(path)}" is not a file`);
    }

    return output;
  }

  public list(path: string[]): INode[] {
    console.debug("List requested for path:");
    console.debug(path);

    const node: INode = this.stat(path);

    if (node instanceof Directory) {
      return (node as Directory).children;
    } else {
      throw new DirectoryNotFoundError(`The node at "${Path.render(path)}" is not a directory`);
    }
  }

  public stat(path: string[]): INode {
    let currNode: Directory = this.root;
    path = path.slice(1, path.length);

    console.debug("Stat requested for path:");
    console.debug(path);

    for (let i = 0; i < path.length; i++) {
      const pathPart = path[i];
      let foundPathPart: boolean = false;

      for (const searchNode of currNode.children) {
        console.debug(`Searching for path part ${pathPart} in ${searchNode.name}`);

        if (i === path.length - 1 && searchNode.name === pathPart) {
          foundPathPart = true;
          return searchNode;
        } else if (searchNode instanceof Directory && searchNode.name === pathPart) {
          foundPathPart = true;
          currNode = searchNode;
        }
      }

      if (!foundPathPart) {
        path.unshift("root");
        throw new InvalidPathError(`The path "${Path.render(path)}" is invalid`);
      }
    }

    return currNode;
  }

  public getParent(path: string[]): Directory {
    let currNode: Directory = this.root;

    for (let i = 0; i < path.length; i++) {
      const pathPart = path[i];

      for (const searchNode of currNode.children) {
        if (i === path.length - 1 && searchNode.name === pathPart) {
          return currNode;
        } else if (searchNode instanceof Directory && searchNode.name === pathPart) {
          currNode = searchNode;
        }
      }
    }

    path.unshift("root");
    throw new InvalidPathError(`The path "${Path.render(path)}" is invalid`);
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
      bin.addChild(programFile);
    }

    this.root.addChild(bin);
  }
}
