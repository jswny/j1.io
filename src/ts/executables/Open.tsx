import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Document, Page } from "react-pdf/dist/entry.webpack";

import { CodeBlock } from "../components/CodeBlock";
import { Gist } from "../components/Gist";
import { ArgumentError } from "../errors/ArgumentError";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
import { GistFile } from "../filesystem/GistFile";
import { IFS } from "../filesystem/IFS";
import { Path } from "../filesystem/Path";
import { history } from "../History";
import { Shell } from "../Shell";
import { IExecutable } from "./IExecutable";

import "../../css/open.css";

export class Open implements IExecutable {
  public name: string;

  constructor() {
    this.name = "open";
  }

  public run(shell: Shell, fs: IFS, args: string[]): JSX.Element {
    if (args.length === 0) {
      throw new ArgumentError(
        `Executable ${this.name} called with ${args.length} arguments, but at least ${1} required`
      );
    }

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
        this.pushHistory(path);
        break;
      }
      case FileType.PDF: {
        result = (
          <div className="output-pdf">
            <Document file={ this.buildBase64PDFData(file.content) } onLoadSuccess={(pdf) => console.debug(`Loaded PDF file ${file.name}`)}>
              <Page pageNumber={ 1 }/>
            </Document>
            <div className="output-additional-link output-pdf-link">
              <a href={ this.buildBase64PDFData(file.content) }>Download</a>
            </div>
          </div>
        );
        this.pushHistory(path);
        break;
      }
      case FileType.Link: {
        this.redirectExternal(file.content);
        break;
      }
      case FileType.Gist: {
        result = <Gist gistFile={ new GistFile(file.content) } />;
        this.pushHistory(path);
        break;
      }
      default: {
        result = <div>{ output }</div>;
        this.pushHistory(path);
      }
    }

    return result;
  }

  private pushHistory(path: string[]): void {
    console.debug("Pushing path to history: ");
    console.debug(path);
    history.push(Path.render(path));
  }

  private redirectExternal(url: string) {
    window.location.href = url;
  }

  private buildBase64PDFData(base64Content: string) {
    return "data:application/pdf;base64," + base64Content;
  }
}
