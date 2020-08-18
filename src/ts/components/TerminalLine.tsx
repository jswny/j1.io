import * as React from "react";

import { ITerminalInputProps, TerminalInput } from "./TerminalInput";

import "../../css/terminal-line.css";

export interface ITerminalLineProps {
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
        <span className="terminal-prompt">
          {this.props.directory} {this.props.prompt}
        </span>
        <TerminalInput
          value={this.props.inputProps.value}
          active={this.props.inputProps.active}
          handleSubmitFunction={(input: string) =>
            this.props.inputProps.handleSubmitFunction(input)
          }
          updateValueFunction={(input: string) =>
            this.props.inputProps.updateValueFunction(input)
          }
        />
        <div className="terminal-output"> {this.props.output}</div>
      </div>
    );
  }
}
