import * as React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";

import { Directory } from "../filesystem/Directory";
import { File } from "../filesystem/File";
import { IFS } from "../filesystem/IFS";
import { LocalFS } from "../filesystem/LocalFS";
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
    const rootDirectoryName: string = this.fs.root.name === "root" ? "/" : this.fs.root.name;
    routes.map((route) => {
      if (route.path[0] === "root") {
        route.path[0] = "/";
      }
    });

    return (
      <HashRouter>
        <Switch>
          {this.renderRoutes(routes)}
        </Switch>
      </HashRouter>
    );
  }

  private renderRoutes(routes: IRoute[]): JSX.Element[] {
    console.debug("Router rendering routes:");
    console.debug(routes);

    const elements: JSX.Element[] = [];
    let key = 0;

    elements.push(
      <Route key={key} exact path="/">
        <Terminal filesystem={this.fs} prompt="> " initialCommand={null} />
      </Route>
    );

    for (const route of routes) {
      const path = route.path.join("/") + route.file.name;
      const command = "cat" + " /" + path;

      elements.push(
        <Route key={key} exact path={path}>
          <Terminal filesystem={this.fs} prompt="> " initialCommand={command} />
        </Route>
      );

      key++;
    }

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
