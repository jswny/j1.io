import * as React from "react";

import { ITerminalInputProps, TerminalInput } from "./TerminalInput";

interface ITerminalLineProps {
  directory: string;
  prompt: string;
  output: JSX.Element;
  inputProps: ITerminalInputProps;
}

export class TerminalLine extends React.Component<ITerminalLineProps> {
  constructor(props: ITerminalLineProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <div className="terminal-line">
        <span className="terminal-prompt">{this.props.directory} {this.props.prompt}</span>
        <TerminalInput
          autofocus={this.props.inputProps.autofocus}
          handleSubmitFunction={(input: string) => this.props.inputProps.handleSubmitFunction(input)}
        />
        <div className="terminal-output"> { this.props.output }</div>
      </div>
    );
  }
}
