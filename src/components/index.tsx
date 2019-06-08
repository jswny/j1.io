import * as React from "react";
import * as ReactDOM from "react-dom";

import "../css/main.css";

import { Terminal } from "./Terminal";

ReactDOM.render(
  <Terminal prompt="> " />,
  document.getElementById("main")
);
