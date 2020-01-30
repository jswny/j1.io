import { Directory } from "./Directory";
import { IProgram } from "../program/IProgram";

export interface IFS {
  read(path: string): void;

  stat(path: string): boolean;

  getPrograms(): IProgram[];
}
