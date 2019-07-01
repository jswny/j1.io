import * as React from "react";
import { ProgramNotFoundError } from "../ProgramNotFoundError";
import { Shell } from "../Shell";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface ITerminalProps { prompt: string; }
interface ILine { output: string; directory: string; }
interface ITerminalState { lines: ILine[]; }

export class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);
    this.shell = new Shell();
    this.state = { lines: [this.newLine()] };
  }

  public render() {
    return (
      <div id="terminal">{this.renderLines()}</div>
    );
  }

  private getCurrentDirectoryCopy() {
    const shellCopy = {...this.shell};
    return shellCopy.currentDirectory;
  }

  private newLine() {
    const directory = this.getCurrentDirectoryCopy();
    const line: ILine = { output: "", directory };
    return line;
  }

  private getCurrentLine() {
    const lines = this.state.lines;
    const currentLine = lines[lines.length - 1];
    return currentLine;
  }

  private updateCurrentLine(transformFunction: (line: ILine) => ILine) {
    const lines = this.state.lines;
    const currentLine = this.getCurrentLine();
    transformFunction(currentLine);
    this.setState({ lines });
  }

  private handleSubmitInput(input: string) {
    const lines = this.state.lines;
    const currentLine = this.getCurrentLine();
    console.debug(`Terminal sending input "${input}" for processing`);
    try {
      currentLine.output = this.shell.command(input);
    } catch (e) {
      if (e instanceof ProgramNotFoundError) {
        currentLine.output = e.message;
      } else {
        throw e;
      }
    }
    const newLine = this.newLine();
    lines.push(newLine);
    this.setState({ lines });
  }

  private renderLines() {
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
          <div className="terminal-output">{this.state.lines[i].output}</div>
        </div>
      );
    }
    return lines;
  }
}
