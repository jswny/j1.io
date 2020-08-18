import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Endpoints, GistsGetResponseData } from "@octokit/types";

import { axios } from "../Axios";
import { CodeBlock } from "../components/CodeBlock";
import { DisplayGistError } from "../errors/DisplayGistError";
import { RetrieveGistError } from "../errors/RetrieveGistError";
import { GistComments } from "./GistComments";

type GetGistResponse = Endpoints["GET /gists/:gist_id"]["response"];

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
      publicUrl: "",
    };
  }

  public componentDidMount(): void {
    this.getGist(this.props.id)
      .then((gist) => {
        console.debug("Received Gist data from API:");
        console.debug(gist);
        this.populateState(gist, this.props.displayFile);
      })
      .catch(() => console.debug(`Could not retrive Gist ID ${this.props.id}`));
  }

  public render(): JSX.Element {
    let result: JSX.Element;
    switch (this.state.language) {
      case "": {
        result = <div></div>;
        break;
      }
      case "Markdown": {
        result = (
          <div className="output-gist">
            <ReactMarkdown
              className="output-markdown output-boxed"
              source={this.state.content}
              renderers={{ code: CodeBlock }}
            />

            <GistComments id={this.props.id} />

            <div className="output-additional-link output-gist-link">
              <a href={this.state.publicUrl}>Comment/Star on Gist</a>
            </div>
          </div>
        );
        break;
      }
      default: {
        throw new DisplayGistError(
          `Rendering not supported for Gist with language ${this.state.language}`
        );
      }
    }

    return result;
  }

  private async getGist(id: string): Promise<GistsGetResponseData> {
    const url = `https://api.github.com/gists/${id}`;
    try {
      const response: GetGistResponse = await axios.get(url);
      return response.data;
    } catch (e) {
      throw new RetrieveGistError(`Could not retrieve Gist at ${url}`);
    }
  }

  private populateState(gist: GistsGetResponseData, displayFile: string): void {
    const displayFileObject = gist.files[displayFile];
    const publicUrl: string = gist.html_url;
    const content: string = displayFileObject.content;
    const language: string = displayFileObject.language;
    this.setState({
      content,
      language,
      publicUrl,
    });
  }
}
