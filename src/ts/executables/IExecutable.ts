import { IFS } from "../filesystem/IFS";
import { IExecutableOutput } from "./IExecutableOutput";

export interface IExecutable {
  name: string;

  run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IFS, args: string[]
  ): IExecutableOutput;
}
