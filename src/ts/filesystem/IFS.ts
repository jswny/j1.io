import { INode } from "./INode";

export interface IFS {
  root: INode;

  read(path: string): void;

  stat(path: string): boolean;
}
