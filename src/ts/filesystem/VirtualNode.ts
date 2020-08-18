import { VirtualDirectory, IVirtualDirectory } from "./VirtualDirectory";
import { VirtualFile, IVirtualFile } from "./VirtualFile";

export type IVirtualNode = IVirtualDirectory | IVirtualFile;

export type VirtualNode = VirtualDirectory | VirtualFile;
