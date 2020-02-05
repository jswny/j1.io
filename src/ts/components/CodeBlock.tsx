import * as React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export interface ICodeBlockProps { value: string; language: string; }
export class CodeBlock extends React.Component<ICodeBlockProps> {
  public render() {
    return (
      <SyntaxHighlighter
        language={this.props.language}
        style={dark}
      >
        {this.props.value}
      </SyntaxHighlighter>
    );
  }
}
