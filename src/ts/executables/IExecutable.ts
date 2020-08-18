import { IVirtualFS } from "../filesystem/IVirtualFS";
import { IExecutableOutput } from "./IExecutableOutput";

export interface IExecutable {
  name: string;

  run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IVirtualFS,
    args: string[]
  ): IExecutableOutput;
}
