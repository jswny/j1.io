import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { axios } from "../Axios";
import { CodeBlock } from "../components/CodeBlock";
import { RetrieveGistError } from "../errors/RetrieveGistError";
import { GistFile } from "../filesystem/GistFile";

export interface IGistProps {
  gistFile: GistFile;
}

export class Gist extends React.Component<IGistProps, { content: string, publicUrl: string }> {
  constructor(props: IGistProps) {
    super(props);
    this.state = { content: "", publicUrl: "" };
  }

  public componentDidMount(): void {
    this
    .getGist(this.props.gistFile.id)
    .then((gist) => {
      console.debug("Recieved Gist data from API:");
      console.debug(gist);
      this.populateState(gist, this.props.gistFile.displayFile);
    });
  }

  public render(): JSX.Element {
    return (
      <div className="output-gist">
        <ReactMarkdown
          className="output-markdown"
          source={ this.state.content }
          renderers={{ code: CodeBlock }}
        />

        <div className="output-additional-link output-gist-link">
          <a href={ this.state.publicUrl }>Comment on Gist</a>
        </div>
      </div>
    );
  }

  private async getGist(id: string): Promise<any> {
    const url: string = `https://api.github.com/gists/${id}`;
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (e) {
      throw new RetrieveGistError(`Could not retrieve Gist at ${url}`);
    }
  }

  private populateState(gist: any, displayFile: string): void {
    const publicUrl: string = gist.html_url;
    const content = gist.files[displayFile].content;
    this.setState({
      content,
      publicUrl
    });
  }
}
