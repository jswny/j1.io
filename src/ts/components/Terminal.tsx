import * as React from "react";

import { ArgumentError } from "../errors/ArgumentError";
import { DirectoryNotFoundError } from "../errors/DirectoryNotFoundError";
import { ExecutableNotFoundError } from "../errors/ExecutableNotFoundError";
import { FileNotFoundError } from "../errors/FileNotFoundError";
import { InvalidPathError } from "../errors/InvalidPathError";
import { RetrieveGistError } from "../errors/RetrieveGistError";
import { IFS } from "../filesystem/IFS";
import { LocalFS } from "../filesystem/LocalFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { TerminalLine } from "./TerminalLine";

import "../../css/terminal.css";

export interface ITerminalProps {
  prompt: string;
  initialCommand: string | null;
}

interface ILine {
  input: string;
  output: JSX.Element;
  directory: string;
}

interface ITerminalState { lines: ILine[]; keyBase: number; }

export class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);

    const fs: IFS = new LocalFS();
    this.shell = new Shell(fs);
    this.processInitialCommand(this.props.initialCommand);
  }

  public render(): JSX.Element {
    return (
      <div id="terminal">{this.renderLines()}</div>
    );
  }

  private processInitialCommand(initialCommand: string) {
    let state = { keyBase: 0, lines: [this.newLine()] };

    if (initialCommand !== null) {
      state = this.updateStateFromInput(initialCommand, state);
    }

    this.state = state;
  }

  private getCurrentDirectoryCopy(): string {
    const shellCopy = {...this.shell};
    return Path.render(shellCopy.currentDirectory);
  }

  private newLine(): ILine {
    const directory = this.getCurrentDirectoryCopy();
    const line: ILine = { input: "" , output: <div></div>, directory };
    return line;
  }

  private getCurrentLine(lines: ILine[]): ILine {
    const currentLine = lines[lines.length - 1];
    return currentLine;
  }

  private clearLines(lines: ILine[]): ILine[] {
    lines = [];
    return lines;
  }

  private updateStateFromInput(input: string, state: ITerminalState): ITerminalState {
    let lines = state.lines;
    let keyBase = state.keyBase;
    const line = this.getCurrentLine(lines);

    line.input = input;
    console.debug(`Terminal sending input "${input}" for processing`);

    try {
      if (input.trim() === "clear") {
        console.debug("Clearing terminal...");
        keyBase = keyBase + lines.length;
        lines = this.clearLines(lines);
      } else {
        const output = this.shell.command(input);
        const renderedOutput = output;
        line.output = renderedOutput;
      }
    } catch (e) {
      if (
        e instanceof ExecutableNotFoundError
        || e instanceof DirectoryNotFoundError
        || e instanceof InvalidPathError
        || e instanceof FileNotFoundError
        || e instanceof ArgumentError
        || e instanceof RetrieveGistError
      ) {
        line.output = <div>{ e.message }</div>;
      } else {
        throw e;
      }
    }

    const newLine = this.newLine();
    lines.push(newLine);
    return { lines, keyBase };
  }

  private handleSubmitInput(input: string): void {
    const newState = this.updateStateFromInput(input, this.state);

    this.setState(newState);
  }

  private renderLines(): JSX.Element[] {
    const lines = [];
    for (let i = 0; i < this.state.lines.length; i++) {
      const currentLine = this.state.lines[i];
      const isLastLine = i === this.state.lines.length - 1 ? true : false;

      const value = currentLine.input;
      const autofocus = isLastLine;

      lines.push(
        <TerminalLine
          key={ this.state.keyBase + i }
          directory={ currentLine.directory }
          prompt={ this.props.prompt }
          output={ currentLine.output }
          inputProps={{
            autofocus,
            handleSubmitFunction: (input: string) => this.handleSubmitInput(input),
            value
          }}
        />
      );
    }
    return lines;
  }
}
