import * as React from "react";

import "../../css/terminal-input.css";

interface ITerminalInputProps { handleSubmitFunction: (input: string) => void; autofocus: boolean; }
interface ITerminalInputState { readonly: boolean; }

export class TerminalInput extends React.Component<ITerminalInputProps, ITerminalInputState> {
  constructor(props: ITerminalInputProps) {
    super(props);
    this.state = { readonly: false };
  }

  public render() {
    return (
      <input
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        autoFocus={this.props.autofocus}
        readOnly={this.state.readonly}
        className="terminal-input"
        onKeyDown={this.handleOnKeyDown}
      />
    );
  }

  private handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) { // Enter
      e.preventDefault();
      this.setState({ readonly: true });
      this.props.handleSubmitFunction(e.currentTarget.value);
    } else {
      console.debug(`Terminal input recieved key "${e.key}"`);
    }
  }
}
