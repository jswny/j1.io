import * as React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface HLJSStyle {
  hljs: {
    display: string;
    overflowX: string;
    padding: string;
    background: string;
    color: string;
  };
  "hljs-keyword": {
    color: string;
    fontWeight: string;
  };
  "hljs-selector-tag": {
    color: string;
    fontWeight: string;
  };
  "hljs-literal": {
    color: string;
    fontWeight: string;
  };
  "hljs-section": {
    color: string;
    fontWeight: string;
  };
  "hljs-link": {
    color: string;
  };
  "hljs-subst": {
    color: string;
  };
  "hljs-string": {
    color: string;
  };
  "hljs-title": {
    color: string;
    fontWeight: string;
  };
  "hljs-name": {
    color: string;
    fontWeight: string;
  };
  "hljs-type": {
    color: string;
    fontWeight: string;
  };
  "hljs-attribute": {
    color: string;
  };
  "hljs-symbol": {
    color: string;
  };
  "hljs-bullet": {
    color: string;
  };
  "hljs-built_in": {
    color: string;
  };
  "hljs-addition": {
    color: string;
  };
  "hljs-variable": {
    color: string;
  };
  "hljs-template-tag": {
    color: string;
  };
  "hljs-template-variable": {
    color: string;
  };
  "hljs-comment": {
    color: string;
  };
  "hljs-quote": {
    color: string;
  };
  "hljs-deletion": {
    color: string;
  };
  "hljs-meta": {
    color: string;
  };
  "hljs-doctag": {
    fontWeight: string;
  };
  "hljs-strong": {
    fontWeight: string;
  };
  "hljs-emphasis": {
    fontStyle: string;
  };
}

export interface ICodeBlockProps {
  value: string;
  language: string;
}
export class CodeBlock extends React.Component<ICodeBlockProps> {
  public render(): JSX.Element {
    const style = dark as HLJSStyle;
    return (
      <SyntaxHighlighter language={this.props.language} style={style}>
        {this.props.value}
      </SyntaxHighlighter>
    );
  }
}
