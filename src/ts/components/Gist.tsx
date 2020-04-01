import * as React from "react";
import * as ReactMarkdown from "react-markdown";

import { axios } from "../Axios";
import { CodeBlock } from "../components/CodeBlock";
import { DisplayGistError } from "../errors/DisplayGistError";
import { RetrieveGistError } from "../errors/RetrieveGistError";
import { GistComments } from "./GistComments";

export interface IGistProps {
  displayFile: string;
  id: string;
}

interface IGistState {
  content: string;
  language: string;
  publicUrl: string;
}

export class Gist extends React.Component<IGistProps, IGistState> {
  constructor(props: IGistProps) {
    super(props);
    this.state = {
      content: "Loading Gist...",
      language: "",
      publicUrl: ""
    };
  }

  public componentDidMount(): void {
    this
    .getGist(this.props.id)
    .then((gist) => {
      console.debug("Received Gist data from API:");
      console.debug(gist);
      this.populateState(gist, this.props.displayFile);
    });
  }

  public render(): JSX.Element {
    let result: JSX.Element;
    switch (this.state.language) {
      case "": {
        result = <div></div>;
      }
      case "Markdown": {
        result = (
          <div className="output-gist">
            <ReactMarkdown
              className="output-markdown output-boxed"
              source={ this.state.content }
              renderers={{ code: CodeBlock }}
            />

            <GistComments id={ this.props.id } />

            <div className="output-additional-link output-gist-link">
              <a href={ this.state.publicUrl }>Comment/Star on Gist</a>
            </div>
          </div>
        );
        break;
      }
      default: {
        throw new DisplayGistError(`Rendering not supported for Gist with language ${this.state.language}`);
      }
    }

    return result;
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
    const displayFileObject: any = gist.files[displayFile];
    const publicUrl: string = gist.html_url;
    const content: string = displayFileObject.content;
    const language: string = displayFileObject.language;
    this.setState({
      content,
      language,
      publicUrl
    });
  }
}
