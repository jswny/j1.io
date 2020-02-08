import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Document, Page } from "react-pdf/dist/entry.webpack";

import { CodeBlock } from "../components/CodeBlock";
import { File } from "../filesystem/File";
import { FileType } from "../filesystem/FileType";
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
        break;
      }
      case FileType.PDF: {
        result = (
          <div className="output-pdf">
            <Document file={ this.buildBase64PDFData(file.content) } onLoadSuccess={(pdf) => console.debug(`Loaded PDF file ${file.name}`)}>
              <Page pageNumber={ 1 }/>
            </Document>
            <div className="output-pdf-link">
              <a href={ this.buildBase64PDFData(file.content) }>Download</a>
            </div>
          </div>
        );
        break;
      }
      case FileType.Link: {
        this.redirectExternal(file.content);
        break;
      }
      default: {
        result = <div>{ output }</div>;
      }
    }

    history.replace(Path.render(path));

    return result;
  }

  private redirectExternal(url: string) {
    window.location.href = url;
  }

  private buildBase64PDFData(base64Content: string) {
    return "data:application/pdf;base64," + base64Content;
  }
}
