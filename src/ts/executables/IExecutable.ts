import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";
import { IExecutableOutput } from "./IExecutableOutput";

export interface IExecutable {
  name: string;

  run(shell: Shell, fs: IFS, args: string[]): IExecutableOutput;
}
