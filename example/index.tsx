import React from "react";
import ReactDOM from "react-dom";
import { FileTree } from "../src/lib";

ReactDOM.render(
  <div style={{ height: "100vh", width: "300px" }}>
    <FileTree />
  </div>,
  document.getElementById("app")
);
