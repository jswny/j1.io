import * as React from "react";
import { Shell } from "../Shell";
import { ProgramNotFoundError } from "../ProgramNotFoundError";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface TerminalProps { prompt: string; }
interface Line { input: string; output: string; directory: string; }
interface TerminalState { 
  currentText: string; 
  lines: Array<Line> 
}

export class Terminal extends React.Component<TerminalProps, TerminalState> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.shell = new Shell();
    this.state = { 
      currentText: "", 
      lines: [this.newLine()] 
    };
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleOnKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleOnKeyDown);
  }

  private getCurrentDirectoryCopy() {
    const shellCopy = {...this.shell};
    console.log(this.shell === shellCopy);
    return shellCopy.currentDirectory;
  }

  private newLine() {
    const directory = this.getCurrentDirectoryCopy();
    const line: Line = { input: "", output: "", directory: directory };
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

  private handleEnter() {
    let lines = this.state.lines;
    let currentLine = this.getCurrentLine();
    console.debug(`Terminal sending input "${currentLine.input}" for processing`);
    try {
      currentLine.output = this.shell.command(currentLine.input);
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
  
  handleOnKeyDown = (e: KeyboardEvent) => {
    if (e.keyCode === 13) { // Enter
      this.handleEnter();
    } else if (e.keyCode === 8) { // Backspace
      this.updateCurrentLine((line) => {
        line.input = line.input.slice(0, -1);
        return line;
      });
    } else if (e.keyCode === 32 || (e.keyCode >= 49 && e.keyCode <= 90) || e.keyCode === 190 || e.keyCode === 191) { // Valid keys for input (space, 0-9, a-Z, period, forward slash)
      this.updateCurrentLine((line) => {
        line.input += e.key;
        return line;
      });
    }
  }

  renderLines() {
    let lines = [];
    for (let i = 0; i < this.state.lines.length; i++) {
      lines.push(
        <div key={i} className="terminal-line">
          <span className="terminal-prompt">{this.state.lines[i].directory} {this.props.prompt}</span>
          <TerminalInput text={this.state.lines[i].input} />
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
