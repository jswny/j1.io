import { Shell } from "./Shell";

export interface IProgram {
  name: string;

  run(shell: Shell, args: string[]): string;
}
