import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";

export interface IProgram {
  name: string;

  run(shell: Shell, fs: IFS, args: string[]): string;
}
