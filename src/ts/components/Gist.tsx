import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { axios } from "../Axios";
import { CodeBlock } from "../components/CodeBlock";
import { RetrieveGistError } from "../errors/RetrieveGistError";

export interface IGistProps {
  url: string;
}

export class Gist extends React.Component<IGistProps, { content: string }> {
  constructor(props: IGistProps) {
    super(props);
    this.state = { content: "" };
  }

  public componentDidMount(): void {
    this.getGistContent(this.props.url).then((gistContent) => this.setState({ content: gistContent }));
  }

  public render(): JSX.Element {
    return (
      <ReactMarkdown
        className="output-markdown"
        source={ this.state.content }
        renderers={{ code: CodeBlock }}
      />
    );
  }

  private async getGistContent(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      return response.data as string;
    } catch (e) {
      throw new RetrieveGistError(`Could not retrieve Gist at ${url}`);
    }
  }
}
