import React from "react";
import { TreeNode } from "./type";

interface FileItemProps {
  icon: React.ReactNode;
  filename: React.ReactNode;
}

function FileItem(props: FileItemProps) {
  return (
    <div className="file-tree__file-item" style={{ display: "flex", width: '100%' }}>
      <span className="file-tree__icon">{props.icon}</span>
      <span
        className="file-tree__filename"
        style={{
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
          wordBreak: "break-all",
        }}
      >
        {props.filename}
      </span>
    </div>
  );
}

export default FileItem;
