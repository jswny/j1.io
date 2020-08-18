import { PDFDocumentProxy } from "pdfjs-dist";
import * as React from "react";
import { Document, Page } from "react-pdf/dist/entry.webpack";

import "react-pdf/dist/Page/AnnotationLayer.css";

export interface IPDFProps {
  name: string;
  base64: string;
}

export class PDF extends React.Component<IPDFProps, { numPages: number }> {
  constructor(props: IPDFProps) {
    super(props);

    this.state = { numPages: 1 };
  }

  public render(): JSX.Element {
    const base64Data: string = this.buildBase64PDFData(this.props.base64);

    return (
      <div className="output-pdf">
        <Document file={base64Data} onLoadSuccess={(pdf) => this.onLoad(pdf)}>
          {this.buildPages()}
        </Document>
        <div className="output-additional-link output-pdf-link">
          <a href={this.buildBase64PDFData(this.props.base64)}>Download</a>
        </div>
      </div>
    );
  }

  private buildBase64PDFData(base64Content: string) {
    return "data:application/pdf;base64," + base64Content;
  }

  private onLoad(pdf: PDFDocumentProxy) {
    this.setState({ numPages: pdf.numPages });
    console.debug(`Loaded PDF file ${this.props.name}`);
  }

  private buildPages(): JSX.Element[] {
    const pages: JSX.Element[] = [];
    for (let i = 1; i < this.state.numPages + 1; i++) {
      pages.push(<Page key={i} pageNumber={i} />);
    }
    return pages;
  }
}
