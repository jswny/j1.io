import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { CodeBlock } from "../../components/CodeBlock";
import { IVirtualFile } from "../IVirtualFile";

export class VirtualFileMarkdown implements IVirtualFile {
  readonly name: string;
  readonly content: string;

  public open(): JSX.Element {
    const result = (
      <ReactMarkdown
        className="output-markdown output-boxed"
        source={this.content}
        renderers={{ code: CodeBlock }}
      />
    );

    return result;
  }
}
