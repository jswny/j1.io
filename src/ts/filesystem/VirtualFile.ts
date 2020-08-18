import { VirtualFileType } from "./VirtualFileType";

export interface IVirtualFile {
  name: string;
  type: VirtualFileType;
  content: string;
}

export class VirtualFile {
  public name: string;
  public type: VirtualFileType;
  public content: string;

  constructor(name: string, type: VirtualFileType, content: string) {
    this.name = name;
    this.type = type;
    this.content = content;
  }
}
