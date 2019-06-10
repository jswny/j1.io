import * as React from "react";
import { Shell } from "../Shell";
import { TerminalInput } from "./TerminalInput";

import "../../css/terminal.css";

export interface TerminalProps { prompt: string; }
interface TerminalState { currentText: string; }


export class Terminal extends React.Component<TerminalProps, TerminalState> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.state = { currentText: "" };
    this.shell = new Shell();
  }

  componentDidMount() {
    document.addEventListener("keydown", this.handleOnKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleOnKeyDown);
  }

  handleOnKeyDown = (e: KeyboardEvent) => {
    console.log(e.key);
    switch (e.key) {
      case "Enter":
        // Handle this
        break;
      case "Backspace":
        this.setState({ currentText: this.state.currentText.slice(0, -1) });
        break;
      default:
        this.setState({ currentText: this.state.currentText + e.key });
    }
  }

  render() {
    return (
      <div className="terminal-line">
        <span className="terminal-prompt">{this.props.prompt}</span>
        <TerminalInput text={this.state.currentText} />
      </div>
    );
  }
}
