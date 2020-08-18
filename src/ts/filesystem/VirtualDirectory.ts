import { Node, INode } from "./Node";

export interface IVirtualDirectory {
  name: string;
  children: INode[];
}

export class VirtualDirectory {
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
