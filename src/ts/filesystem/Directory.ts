import { INode } from "./INode";

export class Directory implements INode {
  public name: string;
  public children: INode[];

  constructor(name: string) {
    this.name = name;
    this.children = [];
  }

  public addChild(child: INode): number {
    return this.children.push(child);
  }
}
