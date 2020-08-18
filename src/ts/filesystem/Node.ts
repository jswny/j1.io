import { Directory, IDirectory } from "./Directory";
import { File, IFile } from "./File";

export type INode = IDirectory | IFile;

export type Node = Directory | File;
