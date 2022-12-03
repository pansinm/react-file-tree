import React from "react";
import ReactDOM from "react-dom";
import { Tree } from "./Tree";
import "../styles.css";
import '../icons.css'

ReactDOM.render(
  <div style={{ display: "flex" }}>
    <div style={{ height: "100vh", width: "300px" }}>
      <Tree iconType="emoji" />
    </div>
    <div style={{ height: "100vh", width: "300px" }}>
      <Tree iconType="file-icon" />
    </div>
  </div>,

  document.getElementById("app")
);
