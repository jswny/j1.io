import * as React from "react";
import { Shell } from "../Shell";

import "../css/terminal.css";

interface TerminalInputState { text: string; }

export class TerminalInput extends React.Component<{}, TerminalInputState> {
  constructor(props: {}) {
    super(props);
    this.state = { text: "" };
  }

  handleOnKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // process the command
    } else {
      this.setState({ text: e.currentTarget.value });
    }
    console.log(this.state.text)
  }

  render() {
    return (
      <input className="terminal-input" type="text" onKeyPress={this.handleOnKeyPress}></input>
    )
  }
}