import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";

export interface IExecutable {
  name: string;

  run(shell: Shell, fs: IFS, args: string[]): JSX.Element;
}
