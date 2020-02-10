import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { CodeBlock } from "../components/CodeBlock";
import { Gist } from "../components/Gist";
import { PDF } from "../components/PDF";
import { ArgumentError } from "../errors/ArgumentError";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { GistFile } from "../filesystem/GistFile";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

import "../../css/open.css";

export class Open implements IExecutable {
  public name: string;

  constructor() {
    this.name = "open";
  }

  public run(shell: Shell, fs: IFS, args: string[]): IExecutableOutput {
    if (args.length === 0) {
      throw new ArgumentError(
        `Executable ${this.name} called with ${args.length} arguments, but at least ${1} required`
      );
    }

    let historyPath: string[] = null;

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
            renderers={{ code: CodeBlock }}
          />
        );
        historyPath = path;
        break;
      }
      case FileType.PDF: {
        result = <PDF name={ file.name } base64={ file.content }/>;
        historyPath = path;
        break;
      }
      case FileType.Link: {
        this.redirectExternal(file.content);
        break;
      }
      case FileType.Gist: {
        result = <Gist gistFile={ new GistFile(file.content) } />;
        historyPath = path;
        break;
      }
      default: {
        result = <div>{ output }</div>;
        historyPath = path;
      }
    }

    return {
      historyPath,
      output: result
    };
  }

  private redirectExternal(url: string) {
    window.location.href = url;
  }
}
