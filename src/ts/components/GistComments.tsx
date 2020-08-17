import * as React from "react";
import * as ReactMarkdown from "react-markdown";
import { Endpoints } from "@octokit/types";

import { axios } from "../Axios";
import { CodeBlock } from "../components/CodeBlock";
import { RetrieveGistCommentsError } from "../errors/RetrieveGistCommentsError";

type ListGistCommentsResponse = Endpoints["GET /gists/:gist_id/comments"]["response"];

export interface IGistCommentsProps {
  id: string;
}

interface IGistCommentsState {
  showComments: boolean;
  comments: IRenderedComment[];
}

interface IRenderedComment {
  username: string;
  content: string;
}

export class GistComments extends React.Component<IGistCommentsProps, IGistCommentsState> {
  constructor(props: IGistCommentsProps) {
    super(props);
    this.state = {
      comments: [],
      showComments: false
    };
  }

  public componentDidMount(): void {
    this
    .getGistComments(this.props.id)
    .then((gistComments) => {
      console.debug("Recieved Gist comments data from API:");
      console.debug(gistComments);
      this.populateState(gistComments);
    });
  }

  public render(): JSX.Element {
    return (
      <div className="output-gist-comments">
        {
          this.state.showComments ? this.renderComments() : this.renderShowCommentsButton()
        }
      </div>
    );
  }

  private renderShowCommentsButton() {
    return (
      <button
        className="show-comments-button"
        onClick={ (event) => this.onShowCommentsClick(event) }
      >
        Show Comments
      </button>
    );
  }

  private renderComments(): JSX.Element | JSX.Element[] {
    if (this.state.comments.length === 0) {
      return (
        <div>
          No comments!
        </div>
      );
    }

    return this.state.comments.map((comment: IRenderedComment, index: number) => {
      return (
        <div key={ index } className="output-gist-comments-comment output-boxed">
          <div>{ comment.username }</div>
          <ReactMarkdown
            className="output-markdown"
            source={ comment.content }
            renderers={{ code: CodeBlock }}
          />
        </div>
      );
    });
  }

  private async getGistComments(id: string): Promise<ListGistCommentsResponse> {
    const url = `https://api.github.com/gists/${id}/comments`;
    try {
      const response = await axios.get(url);
      return response.data as ListGistCommentsResponse;
    } catch (e) {
      throw new RetrieveGistCommentsError(`Could not retrieve Gist at ${url}`);
    }
  }

  private populateState(gistComments: any): void {
    const comments: IRenderedComment[] = gistComments.map((comment: any) => {
      const username: string = comment.user.login;
      const content: string = comment.body;
      return {
        content,
        username
      };
    });
    this.setState({ comments });
  }

  private onShowCommentsClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    this.setState({ showComments: true });
  }
}
