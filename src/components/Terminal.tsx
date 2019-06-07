import * as React from "react";
import { Shell } from "../Shell";

export interface TerminalProps { prompt: string; }

export class Terminal extends React.Component<TerminalProps, {}> {
  shell: Shell;

  constructor(props: TerminalProps) {
    super(props);
    this.shell = new Shell();
  }

  handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    console.log(e.currentTarget.value);
    console.log(e)
  }

  render() {
    return (
      <div className="terminal-line">
        <span className="terminal-prompt">{this.props.prompt}</span>
        <input className="terminal-input" type="text" onChange={this.handleChange}></input>
      </div>
    );
  }
}
