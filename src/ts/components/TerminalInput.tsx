import * as React from "react";

import "../../css/terminal-input.css";

export interface ITerminalInputProps {
  value: string;
  autofocus: boolean;
  handleSubmitFunction: (input: string) => void;
}
interface ITerminalInputState { readonly: boolean; value: string; }

export class TerminalInput extends React.Component<ITerminalInputProps, ITerminalInputState> {
  constructor(props: ITerminalInputProps) {
    super(props);
    this.state = { readonly: this.props.value === "" ? false : true, value: this.props.value };
  }

  public render() {
    return (
      <input
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        autoFocus={ this.props.autofocus }
        className="terminal-input"
        onKeyDown={ this.onKeyDown }
        onChange={ this.onChange }
        readOnly={ this.state.readonly }
        value={ this.state.value }
      />
    );
  }

  private onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    this.setState({ value });
  }

  private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) { // Enter
      e.preventDefault();
      this.setState({ readonly: true });
      this.props.handleSubmitFunction(e.currentTarget.value);
    } else {
      console.debug(`Terminal input recieved key "${e.key}"`);
    }
  }
}
