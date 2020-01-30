import { IProgram } from "../program/IProgram";
import { INode } from "./INode";

export interface IFS {
  read(path: string): string;

  list(path: string): INode[];

  stat(path: string): INode;

  getPrograms(): IProgram[];
}
