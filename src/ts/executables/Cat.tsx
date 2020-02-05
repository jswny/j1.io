import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { withRouter } from "react-router-dom";

import { CodeBlock } from "../components/CodeBlock";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";

import "../../css/cat.css";

export class Cat implements IExecutable {
  public name: string;

  constructor() {
    this.name = "cat";
  }

  public run(shell: Shell, fs: IFS, args: string[]): JSX.Element {
    const argPath = args[0];
    const path: string[] = Path.parseAndAdd(shell.currentDirectory, argPath);
    const output = fs.read(path);
    const file: File = fs.stat(path) as File;

    let result: JSX.Element;
    switch (file.type) {
      case FileType.Markdown: {
        result = (
          <ReactMarkdown
            className="output-markdown"
            source={ output }
            renderers={{code: CodeBlock}}
          />
        );
        break;
      }
      default: {
        result = <div>{ output }</div>;
      }
    }

    return result;
  }
}
