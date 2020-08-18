import * as React from "react";

import { ArgumentError } from "../errors/ArgumentError";
import { DirectoryNotFoundError } from "../errors/DirectoryNotFoundError";
import { ExecutableNotFoundError } from "../errors/ExecutableNotFoundError";
import { FileNotFoundError } from "../errors/FileNotFoundError";
import { InvalidPathError } from "../errors/InvalidPathError";
import { RetrieveGistError } from "../errors/RetrieveGistError";
import { IVirtualFS } from "../filesystem/IVirtualFS";
import { ManifestVirtualFS } from "../filesystem/ManifestVirtualFS";
import { VirtualPath } from "../filesystem/VirtualPath";
import { history } from "../History";
import { Shell } from "../Shell";
import { Line } from "./Line";
import { TerminalLine } from "./TerminalLine";

import "../../css/terminal.css";
import { RetrieveGistCommentsError } from "../errors/RetrieveGistCommentsError";

export interface ITerminalProps {
  prompt: string;
  initialCommand: string | null;
}

interface ITerminalState {
  lines: Line[];
  keyBase: number;
  initialCommandExecuted: boolean;
}

export class Terminal extends React.Component<ITerminalProps, ITerminalState> {
  private shell: Shell;

  constructor(props: ITerminalProps) {
    super(props);

    const fs: IVirtualFS = new ManifestVirtualFS();
    this.shell = new Shell(fs);

    this.state = {
      initialCommandExecuted: false,
      keyBase: 0,
      lines: [this.newLine()],
    };
  }

  public componentDidMount(): void {
    const initialCommand: string = this.props.initialCommand;
    if (initialCommand !== null && !this.state.initialCommandExecuted) {
      this.processCommand(initialCommand);
    }

    this.setState({ initialCommandExecuted: true });
  }

  public render(): JSX.Element {
    return <div id="terminal">{this.renderLines()}</div>;
  }

  public updateCurrentLineInput(input: string): void {
    const lines: Line[] = this.state.lines.map((line, index) => {
      if (index === this.getCurrentLineIndex()) {
        return new Line(input, line.getOutput(), line.directory);
      }
      return line;
    });
    this.setState({ lines });
  }

  public processCommand(input: string): void {
    console.debug(`Terminal sending input "${input}" for processing`);

    const currentInput = input;
    let currentOutput: JSX.Element;

    try {
      if (input.trim() === "clear") {
        this.clearLines();
        return;
      } else {
        const commandHandler = (command: string) =>
          this.processCommand(command);
        const { output, historyPath } = this.shell.command(
          commandHandler,
          input
        );

        this.pushHistory(historyPath);

        const renderedOutput = output;
        currentOutput = renderedOutput;
      }
    } catch (e) {
      if (
        e instanceof ExecutableNotFoundError ||
        e instanceof DirectoryNotFoundError ||
        e instanceof InvalidPathError ||
        e instanceof FileNotFoundError ||
        e instanceof ArgumentError ||
        e instanceof RetrieveGistError ||
        e instanceof RetrieveGistCommentsError
      ) {
        currentOutput = <div>{e.message}</div>;
      } else {
        throw e;
      }
    }

    let lines: Line[] = this.state.lines.map((line, index) => {
      if (index === this.getCurrentLineIndex()) {
        return new Line(currentInput, currentOutput, line.directory);
      }
      return line;
    });

    lines = [...lines, this.newLine()];
    this.setState({ lines });
  }

  private pushHistory(path: string[]): void {
    if (path !== null && this.state.initialCommandExecuted) {
      console.debug("Pushing path to history: ");
      console.debug(path);
      history.push(VirtualPath.render(path));
    }
  }

  private renderCurrentDirectoryCopy(): string {
    const currentDirectory = this.shell.getCurrentDirectoryCopy();
    return VirtualPath.render(currentDirectory);
  }

  private getCurrentLineIndex(): number {
    const lines: Line[] = this.state.lines;
    return lines.length - 1;
  }

  private newLine() {
    return new Line(null, null, this.renderCurrentDirectoryCopy());
  }

  private clearLines(): void {
    const keyBase: number = this.state.keyBase + this.state.lines.length;
    this.setState({ lines: [this.newLine()], keyBase });
  }

  private renderLines(): JSX.Element[] {
    const lines = [];
    for (let i = 0; i < this.state.lines.length; i++) {
      const currentLine = this.state.lines[i];
      const isLastLine = i === this.state.lines.length - 1 ? true : false;

      const value = currentLine.input;
      const active = isLastLine;

      lines.push(
        <TerminalLine
          key={this.state.keyBase + i}
          directory={currentLine.directory}
          prompt={this.props.prompt}
          output={currentLine.getOutput()}
          inputProps={{
            active,
            handleSubmitFunction: (input: string) => this.processCommand(input),
            updateValueFunction: (input: string) =>
              this.updateCurrentLineInput(input),
            value,
          }}
        />
      );
    }
    return lines;
  }
}
