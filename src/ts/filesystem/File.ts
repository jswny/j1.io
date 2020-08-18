import { FileType } from "./FileType";

export interface IFile {
  name: string;
  type: FileType;
  content: string;
}

export class File {
  public name: string;
  public type: FileType;
  public content: string;

  constructor(name: string, type: FileType, content: string) {
    this.name = name;
    this.type = type;
    this.content = content;
  }
}
