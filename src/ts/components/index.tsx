import * as React from "react";
import * as ReactDOM from "react-dom";

import "../../css/main.css";

import { Terminal } from "./Terminal";

console.log("Yes I wrote this all from scratch. Welcome ;)");

ReactDOM.render(
  <Terminal prompt="> " initialCommand={"ls"} />,
  document.getElementById("main")
);
