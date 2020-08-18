import { Directory, IDirectory } from "./Directory";
import { VirtualFile, IVirtualFile } from "./VirtualFile";

export type INode = IDirectory | IVirtualFile;

export type Node = Directory | VirtualFile;
