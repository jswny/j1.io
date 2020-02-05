import * as React from "react";
import * as ReactDOM from "react-dom";
import { HashRouter, Route, Switch } from "react-router-dom";

import { Terminal } from "./Terminal";

import "../../css/main.css";

console.log("Yes I wrote this all from scratch. Welcome ;)");

const app = (
  <HashRouter>
    <Switch>
      <Route exact path="/">
        <Terminal prompt="> " initialCommand={null} />
      </Route>
      <Route exact path="/post">
        <Terminal prompt="> " initialCommand={"ls"} />
      </Route>
    </Switch>
  </HashRouter>
);

ReactDOM.render(app, document.getElementById("main"));
