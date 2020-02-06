import * as React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { Directory } from "../filesystem/Directory";
import { File } from "../filesystem/File";
import { IFS } from "../filesystem/IFS";
import { LocalFS } from "../filesystem/LocalFS";
import { Path } from "../filesystem/Path";
import { Terminal } from "./Terminal";

import "../../css/main.css";

console.log("Yes I wrote this all from scratch ;)");

interface IRoute { path: string[]; file: File; }

export class App extends React.Component<{}, {}> {
  private fs: IFS;

  public constructor(props: {}) {
    super(props);
    this.fs = new LocalFS();
  }

  public render(): JSX.Element {
    const routes: IRoute[] = this.buildRoutes(this.fs.root, []);

    console.debug("Router built routes:");
    console.debug(routes);

    return (
      <HashRouter>
        <Switch>
          {this.renderRoutes(routes)}
        </Switch>
      </HashRouter>
    );
  }

  private renderRoutes(routes: IRoute[]): JSX.Element[] {
    const elements: JSX.Element[] = [];
    let key = 0;

    elements.push(
      <Route key={key} exact path="/">
        <Terminal filesystem={this.fs} prompt="> " initialCommand={null} />
      </Route>
    );

    for (const route of routes) {
      const pathParts = route.path.slice(0);
      pathParts.push(route.file.name);
      const path = Path.render(pathParts);
      const executable = "open";
      const command = executable + " " + path;

      elements.push(
        <Route key={key} exact path={path}>
          <Terminal filesystem={this.fs} prompt="> " initialCommand={command} />
        </Route>
      );

      key++;
    }

    console.debug("Router rendering routes:");
    console.debug(elements);

    return elements;
  }

  private buildRoutes(directory: Directory, path: string[]): IRoute[] {
    path.push(directory.name);
    let routes: IRoute[] = [];

    for (const node of directory.children) {
      if (node instanceof File) {
        routes.push({ path, file: node });
      } else {
        const nodeRoutes = this.buildRoutes(node as Directory, path.slice(0));
        routes = routes.concat(nodeRoutes);
      }
    }

    return routes;
  }
}
