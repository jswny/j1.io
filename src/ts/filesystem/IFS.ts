import { IProgram } from "../program/IProgram";
import { Directory } from "./Directory";
import { INode } from "./INode";

export interface IFS {
  root: Directory;

  read(path: string[]): string;

  list(path: string[]): INode[];

  stat(path: string[]): INode;

  getParent(path: string[]): Directory;

  getPrograms(): IProgram[];
}
