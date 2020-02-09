import * as React from "react";
import { Route, Router, Switch } from "react-router-dom";

import { history } from "../History";
import { Terminal } from "./Terminal";

import "../../css/main.css";

export class App extends React.Component<{}, {}> {
  public constructor(props: {}) {
    super(props);
  }

  public render(): JSX.Element {
    return (
      <Router history={history}>
        <Switch>
          <Route
            path="/:path"
            render={ (props) => <Terminal prompt="> " initialCommand={this.renderCommand(props.match.params.path)} /> }
          />
          <Route path="*">
            <Terminal prompt="> " initialCommand={null} />
          </Route>
        </Switch>
      </Router>
    );
  }

  private renderCommand(path: string) {
    console.debug(`Routing to path from URL: ${path}`);
    const executable = "open";
    const command = executable + " " + path;
    return command;
  }
}
