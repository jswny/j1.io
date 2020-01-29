import { Directory } from "./Directory";
import { File } from "./File";
import { IFS } from "./IFS";
import { INode } from "./INode";

import * as manifest from "../../../dist/LocalFileManifest.json";

export class LocalFS implements IFS {
  root: INode;

  constructor() {
    console.debug("Loading filesystem manifest:");
    console.debug(manifest);
    this.root = this.build(manifest);
    console.debug("Successfully loaded filesystem manifest:");
    console.debug(this.root);
  }

  public read(path: string): void {
    throw new Error("Method not implemented.");
  }

  public stat(path: string): boolean {
    throw new Error("Method not implemented.");
  }

  private build(jsonNode: any): INode {
    if ("children" in jsonNode) {
      const node: Directory = new Directory(jsonNode.name);
      for (const child of jsonNode.children) {
        node.addChild(this.build(child));
      }
      return node;
    } else {
      const node: File = new File(jsonNode.name, jsonNode.type, jsonNode.content);
      return node;
    }
  }
}
