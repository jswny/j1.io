import { IExecutable } from "../executables/IExecutable";
import { Directory } from "./Directory";
import { Node } from "./Node";

export interface IFS {
  root: Directory;

  read(path: string[]): string;

  list(path: string[]): Node[];

  stat(path: string[]): Node;

  getExecutables(): IExecutable[];
}
