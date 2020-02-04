import * as React from "react";
import { ProgramNotFoundError } from "../program/ProgramNotFoundError";
import { Shell } from "../Shell";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";
import { DirectoryNotFoundError } from "../filesystem/DirectoryNotFoundError";
import { FileNotFoundError } from "../filesystem/FileNotFoundError";
import { InvalidPathError } from "../filesystem/InvalidPathError";
import { Path } from "../filesystem/Path";

export interface ITerminalProps { prompt: string; }
interface ILine { output: JSX.Element; directory: string; }
interface ITerminalState { lines: ILine[]; }

export class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);
    this.shell = new Shell();
    this.state = { lines: [this.newLine()] };
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

  private renderCommandOutput(output: string): string {
    const split = output.split("\n");
    if (split.length > 1) {
      output = split
        .map((item, i) => `<p key=${i}>${item}</p>`)
        .join("");
    }

    return output;
  }

  private handleSubmitInput(input: string): void {
    const lines = this.state.lines;
    const currentLine = this.getCurrentLine();
    console.debug(`Terminal sending input "${input}" for processing`);
    try {
      const output = this.shell.command(input);
      // const renderedOutput = this.renderCommandOutput(output);
      const renderedOutput = output;
      currentLine.output = renderedOutput;
    } catch (e) {
      if (
        e instanceof ProgramNotFoundError
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
    let autofocus = false;
    for (let i = 0; i < this.state.lines.length; i++) {
      autofocus = i === this.state.lines.length - 1 ? true : false;
      lines.push(
        <div key={i} className="terminal-line">
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
