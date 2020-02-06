import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

import { DirectoryNotFoundError } from "../errors/DirectoryNotFoundError";
import { ExecutableNotFoundError } from "../errors/ExecutableNotFoundError";
import { FileNotFoundError } from "../errors/FileNotFoundError";
import { InvalidPathError } from "../errors/InvalidPathError";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { TerminalLine } from "./TerminalLine";

import "../../css/terminal.css";

export interface ITerminalProps extends RouteComponentProps {
  filesystem: IFS;
  prompt: string;
  initialCommand: string | null;
}
interface ILine {
  input: string;
  output: JSX.Element;
  directory: string;
}
interface ITerminalState { lines: ILine[]; keyBase: number; }

class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);

    this.shell = new Shell(this.props.filesystem);
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
      state = this.updateStateFromInput(initialCommand, state.lines, state.keyBase);
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

  private updateStateFromInput(input: string, lines: ILine[], keyBase: number): ITerminalState {
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
    const lines = this.state.lines;
    const keyBase = this.state.keyBase;
    const newState = this.updateStateFromInput(input, lines, keyBase);

    this.setState(newState);
  }

  private renderLines(): JSX.Element[] {
    const lines = [];
    for (let i = 0; i < this.state.lines.length; i++) {
      const currentLine = this.state.lines[i];
      const isLastLine = i === this.state.lines.length - 1 ? true : false;

      const value = currentLine.input;
      const autofocus = isLastLine;
      const readonly = !isLastLine;

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

const wR = withRouter(Terminal);
export { wR as Terminal };
