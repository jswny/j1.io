import * as React from "react";
import { Shell } from "../Shell";
import { TerminalInput } from "./TerminalInput";

export interface TerminalProps { prompt: string; }

export class Terminal extends React.Component<TerminalProps, {}> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.shell = new Shell();
  }

  render() {
    return (
      <div className="terminal-line">
        <span className="terminal-prompt">{this.props.prompt}</span>
        <TerminalInput />
      </div>
    );
  }
}
