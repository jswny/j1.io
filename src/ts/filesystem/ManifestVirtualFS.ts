import * as manifest from "../../../dist/LocalFileManifest.json";
import { DirectoryNotFoundError } from "../errors/DirectoryNotFoundError";
import { FileNotFoundError } from "../errors/FileNotFoundError";
import { InvalidPathError } from "../errors/InvalidPathError";
import { Cd } from "../executables/Cd";
import { IExecutable } from "../executables/IExecutable";
import { Ls } from "../executables/Ls";
import { Open } from "../executables/Open";
import { VirtualDirectory, IVirtualDirectory } from "./VirtualDirectory";
import { VirtualFile } from "./VirtualFile";
import { VirtualFileType } from "./VirtualFileType";
import { IVirtualFS } from "./IVirtualFS";
import { VirtualNode } from "./VirtualNode";
import { VirtualPath } from "./VirtualPath";

export class ManifestVirtualFS implements IVirtualFS {
  public root: VirtualDirectory;
  private executables: IExecutable[];

  constructor() {
    console.debug("Loading filesystem manifest:");
    console.debug(manifest);

    this.root = this.build(manifest as IVirtualDirectory);
    this.root.name = "root";

    console.debug(`Root type: ${this.root.constructor.name}`);

    console.debug("Successfully loaded filesystem:");
    console.debug(this.root);

    const executablesToLoad = [new Cd(), new Ls(), new Open()];
    this.loadExecutables(executablesToLoad);

    console.debug("Loaded executables:");
    console.debug(this.executables);
    console.debug("New filesystem:");
    console.debug(this.root);
  }

  public read(path: string[]): string {
    console.debug("Read requested for path:");
    console.debug(path);

    const node: VirtualNode = this.stat(path);
    let output: string;

    if (node instanceof VirtualFile) {
      const file: VirtualFile = node;
      const readableTypes = [
        VirtualFileType.Markdown,
        VirtualFileType.PDF,
        VirtualFileType.Link,
        VirtualFileType.Gist,
      ];
      if (readableTypes.includes(file.type)) {
        console.debug("Found compatible file to read: ");
        console.debug(file);

        output = file.content;
      } else {
        throw new FileNotFoundError(
          `The node at "${VirtualPath.render(path)}" is not a readable file`
        );
      }
    } else {
      throw new FileNotFoundError(
        `The node at "${VirtualPath.render(path)}" is not a file`
      );
    }

    return output;
  }

  public list(path: string[]): VirtualNode[] {
    console.debug("List requested for path:");
    console.debug(path);

    const node: VirtualNode = this.stat(path);

    if (node instanceof VirtualDirectory) {
      return node.children;
    } else {
      throw new DirectoryNotFoundError(
        `The node at "${VirtualPath.render(path)}" is not a directory`
      );
    }
  }

  public stat(path: string[]): VirtualNode {
    let currNode: VirtualDirectory = this.root;
    path = path.slice(1, path.length);

    console.debug("Stat requested for path:");
    console.debug(path);

    for (let i = 0; i < path.length; i++) {
      const pathPart = path[i];
      let foundPathPart = false;

      for (const searchNode of currNode.children) {
        if (i === path.length - 1 && searchNode.name === pathPart) {
          foundPathPart = true;
          return searchNode;
        } else if (
          searchNode instanceof VirtualDirectory &&
          searchNode.name === pathPart
        ) {
          foundPathPart = true;
          currNode = searchNode;
        }
      }

      if (!foundPathPart) {
        path.unshift("root");
        throw new InvalidPathError(
          `The path "${VirtualPath.render(path)}" is invalid`
        );
      }
    }

    return currNode;
  }

  public getExecutables(): IExecutable[] {
    return this.executables;
  }

  private build(jsonNode: IVirtualDirectory): VirtualDirectory {
    const directory: VirtualDirectory = new VirtualDirectory(jsonNode.name);

    for (const child of jsonNode.children) {
      if ("children" in child) {
        directory.addChild(this.build(child));
      } else {
        const file: VirtualFile = new VirtualFile(
          child.name,
          child.type,
          child.content
        );
        directory.addChild(file);
      }
    }

    return directory;
  }

  private loadExecutables(executables: IExecutable[]): void {
    this.executables = executables;

    const bin: VirtualDirectory = new VirtualDirectory("bin");

    for (const executable of executables) {
      const executableFile = new VirtualFile(
        executable.name,
        VirtualFileType.Executable,
        ""
      );
      bin.addChild(executableFile);
    }

    this.root.addChild(bin);
  }
}
