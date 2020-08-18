import { VirtualDirectory, IVirtualDirectory } from "./VirtualDirectory";
import { VirtualFile, IVirtualFile } from "./VirtualFile";

export type INode = IVirtualDirectory | IVirtualFile;

export type Node = VirtualDirectory | VirtualFile;
