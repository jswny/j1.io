import { FileType } from "./FileType";
import { INode } from "./INode";

export class File implements INode {
  public name: string;
  public type: FileType;
  public content: string;

  constructor(name: string, type: FileType, content: string) {
    this.name = name;
    this.type = type;
    this.content = content;
  }
}
