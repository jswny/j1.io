import { Shell } from "./Shell";

export interface Program {
  name: string;
  
  run(shell: Shell, args: Array<string>): string
}