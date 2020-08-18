import { VirtualNode, IVirtualNode } from "./VirtualNode";

export interface IVirtualDirectory {
  name: string;
  children: IVirtualNode[];
}

export class VirtualDirectory {
  public name: string;
  public children: VirtualNode[];

  constructor(name: string) {
    this.name = name;
    this.children = [];
  }

  public addChild(child: VirtualNode): number {
    return this.children.push(child);
  }
}
