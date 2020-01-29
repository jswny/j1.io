import { IFS } from "./IFS";
import { INode } from "./INode";

export class LocalFS implements IFS {
  root: INode;

  constructor(localFiles: JSON) {
    
  }

  public read(path: string): void {
    throw new Error("Method not implemented.");
  }

  public stat(path: string): boolean {
    throw new Error("Method not implemented.");
  }
}
