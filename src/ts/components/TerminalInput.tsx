import * as React from "react";

import "../../css/terminal-input.css";

interface TerminalInputProps { text: string; handleSubmitFunction: (input: string) => void; autofocus: boolean; }
interface TerminalInputState { readonly: boolean; }

export class TerminalInput extends React.Component<TerminalInputProps, TerminalInputState> {
  constructor(props: TerminalInputProps) {
    super(props);
    this.state = { readonly: false };
  }

  handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) { // Enter
      e.preventDefault();
      this.setState({ readonly: true });
      this.props.handleSubmitFunction(e.currentTarget.value);
    } else {
      console.debug(`Terminal input recieved key "${e.key}"`);
    }
  }

  render() {
    // return (
    //   <span contentEditable={true} className="terminal-input" onKeyDown={this.handleOnKeyDown} />
    // )
    return (
      <input spellCheck={false} autoFocus={this.props.autofocus} readOnly={this.state.readonly} className="terminal-input" onKeyDown={this.handleOnKeyDown} />
    )
  }
}