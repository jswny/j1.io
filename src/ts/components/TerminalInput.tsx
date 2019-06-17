import * as React from "react";

import "../../css/terminal-input.css";

interface TerminalInputProps { text: string; }

export class TerminalInput extends React.Component<TerminalInputProps, {}> {
  constructor(props: TerminalInputProps) {
    super(props);
  }

  render() {
    return (
      <span className="terminal-input">{this.props.text}</span>
    )
  }
}