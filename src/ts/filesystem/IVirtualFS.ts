import { IExecutable } from "../executables/IExecutable";
import { VirtualDirectory } from "./VirtualDirectory";
import { VirtualNode } from "./VirtualNode";

export interface IVirtualFS {
  root: VirtualDirectory;

  read(path: string[]): string;

  list(path: string[]): VirtualNode[];

  stat(path: string[]): VirtualNode;

  getExecutables(): IExecutable[];
}
