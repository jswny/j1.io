import * as React from "react";
import { Shell } from "../Shell";
import { ProgramNotFoundError } from "../ProgramNotFoundError";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface TerminalProps { prompt: string; }
interface Line { input: string; output: string; }
interface TerminalState { 
  currentText: string; 
  lines: Array<Line> 
}

export class Terminal extends React.Component<TerminalProps, TerminalState> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.state = { 
      currentText: "", 
      lines: [this.newLine()] 
    };
    this.shell = new Shell();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleOnKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleOnKeyDown);
  }

  private newLine() {
    const line: Line = { input: "", output: "" };
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
    let newLine = this.newLine();
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
          <span className="terminal-prompt">{this.props.prompt}</span>
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
