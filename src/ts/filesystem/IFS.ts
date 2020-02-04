import { IExecutable } from "../executable/IExecutable";
import { Directory } from "./Directory";
import { INode } from "./INode";

export interface IFS {
  root: Directory;

  read(path: string[]): string;

  list(path: string[]): INode[];

  stat(path: string[]): INode;

  getExecutables(): IExecutable[];
}
