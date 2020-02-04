import * as React from "react";

import { DirectoryNotFoundError } from "../filesystem/DirectoryNotFoundError";
import { FileNotFoundError } from "../filesystem/FileNotFoundError";
import { InvalidPathError } from "../filesystem/InvalidPathError";
import { Path } from "../filesystem/Path";
import { ExecutableNotFoundError } from "../executable/ExecutableNotFoundError";
import { Shell } from "../Shell";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface ITerminalProps { prompt: string; }
interface ILine { output: JSX.Element; directory: string; }
interface ITerminalState { lines: ILine[]; keyBase: number; }

export class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);
    this.shell = new Shell();
    this.state = { lines: [this.newLine()], keyBase: 0 };
  }

  public render(): JSX.Element {
    return (
      <div id="terminal">{this.renderLines()}</div>
    );
  }

  private getCurrentDirectoryCopy(): string {
    const shellCopy = {...this.shell};
    return Path.render(shellCopy.currentDirectory);
  }

  private newLine(): ILine {
    const directory = this.getCurrentDirectoryCopy();
    const line: ILine = { output: <div></div>, directory };
    return line;
  }

  private getCurrentLine(): ILine {
    const lines = this.state.lines;
    const currentLine = lines[lines.length - 1];
    return currentLine;
  }

  private clear(): void {
    console.debug("Clearing terminal...");
    const lines: ILine[] = [this.newLine()];
    const keyBase = this.state.keyBase + this.state.lines.length;
    this.setState({ lines, keyBase });
  }

  private handleSubmitInput(input: string): void {
    const lines = this.state.lines;
    const currentLine = this.getCurrentLine();
    console.debug(`Terminal sending input "${input}" for processing`);
    try {
      if (input.trim() === "clear") {
        this.clear();
        return;
      } else {
        const output = this.shell.command(input);
        const renderedOutput = output;
        currentLine.output = renderedOutput;
      }
    } catch (e) {
      if (
        e instanceof ExecutableNotFoundError
        || e instanceof DirectoryNotFoundError
        || e instanceof InvalidPathError
        || e instanceof FileNotFoundError
      ) {
        currentLine.output = <div>{ e.message }</div>;
        // throw e;
      } else {
        throw e;
      }
    }
    const newLine = this.newLine();
    lines.push(newLine);
    this.setState({ lines });
  }

  private renderLines(): JSX.Element[] {
    const lines = [];
    for (let i = 0; i < this.state.lines.length; i++) {
      const autofocus = i === this.state.lines.length - 1 ? true : false;
      lines.push(
        <div key={this.state.keyBase + i} className="terminal-line">
          <span className="terminal-prompt">{this.state.lines[i].directory} {this.props.prompt}</span>
          <TerminalInput
            autofocus={autofocus}
            handleSubmitFunction={(input: string) => this.handleSubmitInput(input)}
          />
          <div className="terminal-output"> { this.state.lines[i].output }</div>
        </div>
      );
    }
    return lines;
  }
}
