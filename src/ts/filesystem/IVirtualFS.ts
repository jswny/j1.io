import { IExecutable } from "../executables/IExecutable";
import { VirtualDirectory } from "./VirtualDirectory";
import { Node } from "./Node";

export interface IVirtualFS {
  root: VirtualDirectory;

  read(path: string[]): string;

  list(path: string[]): Node[];

  stat(path: string[]): Node;

  getExecutables(): IExecutable[];
}
