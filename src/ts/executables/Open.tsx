import * as React from "react";
import { Helmet } from "react-helmet";
import * as ReactMarkdown from "react-markdown";

import { CodeBlock } from "../components/CodeBlock";
import { Gist } from "../components/Gist";
import { PDF } from "../components/PDF";
import { ArgumentError } from "../errors/ArgumentError";
import { VirtualFile } from "../filesystem/VirtualFile";
import { VirtualFileType } from "../filesystem/VirtualFileType";
import { IVirtualFS } from "../filesystem/IVirtualFS";
import { VirtualPath } from "../filesystem/VirtualPath";
import { IExecutable } from "./IExecutable";
import { IExecutableOutput } from "./IExecutableOutput";

import "../../css/open.css";

interface IGistFile {
  displayFile: string;
  id: string;
}

export class Open implements IExecutable {
  public name: string;

  constructor() {
    this.name = "open";
  }

  public run(
    commandHandler: (command: string) => void,
    currentDirectory: string[],
    setCurrentDirectory: (path: string[]) => void,
    fs: IVirtualFS,
    args: string[]
  ): IExecutableOutput {
    if (args.length === 0) {
      throw new ArgumentError(
        `Executable ${this.name} called with ${
          args.length
        } arguments, but at least ${1} required`
      );
    }

    let historyPath: string[] = null;

    const argPath = args[0];
    const path: string[] = VirtualPath.parseAndAdd(currentDirectory, argPath);
    const output = fs.read(path);
    const file: VirtualFile = fs.stat(path) as VirtualFile;

    let result: JSX.Element;
    switch (file.type) {
      case VirtualFileType.Markdown: {
        result = (
          <ReactMarkdown
            className="output-markdown output-boxed"
            source={output}
            renderers={{ code: CodeBlock }}
          />
        );
        historyPath = path;
        break;
      }
      case VirtualFileType.PDF: {
        result = <PDF name={file.name} base64={file.content} />;
        historyPath = path;
        break;
      }
      case VirtualFileType.Link: {
        this.redirectExternal(file.content);
        break;
      }
      case VirtualFileType.Gist: {
        const gistFile: IGistFile = this.parseGistFile(file.content);
        result = <Gist id={gistFile.id} displayFile={gistFile.displayFile} />;
        historyPath = path;
        break;
      }
      default: {
        result = <div>{output}</div>;
        historyPath = path;
      }
    }

    const resultWithTitle: JSX.Element = (
      <>
        <Helmet>
          <title>{file.name} - Joe Sweeney</title>
        </Helmet>
        {result}
      </>
    );

    return {
      historyPath,
      output: resultWithTitle,
    };
  }

  private parseGistFile(jsonString: string): IGistFile {
    console.debug(`Parsing JSON string into Gist file data:`);
    console.debug(jsonString);

    const json = JSON.parse(jsonString) as IGistFile;
    return {
      displayFile: json.displayFile,
      id: json.id,
    };
  }

  private redirectExternal(url: string) {
    window.location.href = url;
  }
}
