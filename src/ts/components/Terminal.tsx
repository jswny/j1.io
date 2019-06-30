import * as React from "react";
import { Shell } from "../Shell";
import { ProgramNotFoundError } from "../ProgramNotFoundError";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface TerminalProps { prompt: string; }
interface Line { output: string; directory: string; }
interface TerminalState { lines: Array<Line> }

export class Terminal extends React.Component<TerminalProps, TerminalState> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.shell = new Shell();
    this.state = { lines: [this.newLine()] };
  }

  private getCurrentDirectoryCopy() {
    const shellCopy = {...this.shell};
    return shellCopy.currentDirectory;
  }

  private newLine() {
    const directory = this.getCurrentDirectoryCopy();
    const line: Line = { output: "", directory: directory };
    return line;
  }

  private getCurrentLine() {
    let lines = this.state.lines;
    let currentLine = lines[lines.length - 1];
    return currentLine;
  }

  private updateCurrentLine(transformFunction: (line: Line) => Line) {
    let lines = this.state.lines;
    let currentLine = this.getCurrentLine();
    transformFunction(currentLine);
    this.setState({ lines: lines });
  }

  private handleSubmitInput(input: string) {
    let lines = this.state.lines;
    let currentLine = this.getCurrentLine();
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
    let newLine = this.newLine();
    lines.push(newLine)
    this.setState({ lines: lines });
  }

  renderLines() {
    let lines = [];
    let autofocus = false;
    for (let i = 0; i < this.state.lines.length; i++) {
      autofocus = i === this.state.lines.length - 1 ? true : false;
      lines.push(
        <div key={i} className="terminal-line">
          <span className="terminal-prompt">{this.state.lines[i].directory} {this.props.prompt}</span>
          <TerminalInput autofocus={autofocus} handleSubmitFunction={(input: string) => this.handleSubmitInput(input)} />
          <div className="terminal-output">{this.state.lines[i].output}</div>
        </div>
      );
    }
    return lines;
  }

  render() {
    return (
      <div id="terminal">{this.renderLines()}</div>
    );
  }
}
