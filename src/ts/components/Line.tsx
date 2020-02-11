import * as React from "react";

export class Line {
  public input: string;
  public directory: string;
  private output: JSX.Element;

  constructor(input: string, output: JSX.Element, directory: string) {
    this.input = input || "";
    this.output = output || <div></div>;
    this.directory = directory;
  }

  public copy(): Line {
    const outputCopy: JSX.Element = React.cloneElement(this.output);
    const lineCopy: Line = new Line(this.input, outputCopy, this.directory);

    return lineCopy;
  }

  public setOutput(output: JSX.Element): void {
    this.output = output;
  }

  public getOutput(): JSX.Element {
    return this.output;
  }
}
