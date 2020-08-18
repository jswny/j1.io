import * as React from "react";

import "../../css/terminal-input.css";

export interface ITerminalInputProps {
  value: string;
  active: boolean;
  handleSubmitFunction: (input: string) => void;
  updateValueFunction: (input: string) => void;
}

export class TerminalInput extends React.Component<ITerminalInputProps> {
  constructor(props: ITerminalInputProps) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <input
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        autoFocus={this.props.active}
        className="terminal-input"
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        readOnly={!this.props.active}
        value={this.props.value}
      />
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value: string = e.target.value;
    // console.debug(`Got input change: ${value}`);
    this.props.updateValueFunction(value);
  };

  private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      // Enter
      e.preventDefault();
      this.props.handleSubmitFunction(e.currentTarget.value);
    }
  };
}
