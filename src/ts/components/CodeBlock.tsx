import * as React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface ICodeBlockProps { value: string; language: string; }
export class CodeBlock extends React.Component<ICodeBlockProps> {
  // constructor(props: ICodeBlockProps) {
  //   super(props);
  //   this.state = { readonly: false };
  // }

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