import { Node, INode } from "./Node";

export interface IDirectory {
  name: string;
  children: INode[];
}

export class Directory {
  public name: string;
  public children: Node[];

  constructor(name: string) {
    this.name = name;
    this.children = [];
  }

  public addChild(child: Node): number {
    return this.children.push(child);
  }
}
