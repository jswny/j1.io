import { History } from "history";
import { IFS } from "../filesystem/IFS";
import { Shell } from "../Shell";

export interface IExecutable {
  name: string;

  run(history: History, shell: Shell, fs: IFS, args: string[]): JSX.Element;
}
