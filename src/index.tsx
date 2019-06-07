import * as React from "react";
import * as ReactDOM from "react-dom";

import { Terminal } from "./components/Terminal";

ReactDOM.render(
  <Terminal prompt="> " />,
  document.getElementById("main")
);
