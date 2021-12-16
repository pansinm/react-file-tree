import React, { CSSProperties, FC } from "react";
import { TreeNode } from "./type";

export interface TreeItemProps {
  style: CSSProperties;
  indent: number;
  indentUnit: string;
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;
  onDragOver?: (
    event: React.DragEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;
  onDrop?: (
    event: React.DragEvent<HTMLDivElement>,
    fromUri: string,
    toUri: string
  ) => void;
  onClick: (treeNode: TreeNode) => void;
  treeNode: TreeNode;
  treeItemRenderer: (treeNode: TreeNode) => React.ReactNode;
}

export const TreeItem: FC<TreeItemProps> = ({
  treeNode,
  onContextMenu,
  treeItemRenderer,
  indent,
  indentUnit,
  style,
  onClick,
  onDragOver,
  onDrop,
}) => {
  return (
    <div
      draggable={true}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = "#fff";
        const from = e.dataTransfer.getData("text/plain");
        const to = treeNode.uri;
        onDrop?.(e, from, to);
      }}
      onDragOver={(e) => {
        e.currentTarget.style.backgroundColor = "#eee";
        e.preventDefault();
        onDragOver?.(e, treeNode);
      }}
      onDragEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#eee";
      }}
      onDragLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#fff";
      }}
      // onDragOver={e => console.log(e)}
      onDragStart={(e) => {
        // e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("text/plain", treeNode.uri);
      }}
      onClick={() => onClick(treeNode)}
      style={{ ...style, paddingLeft: indent + indentUnit }}
      onContextMenu={(e) => onContextMenu?.(e, treeNode)}
    >
      {treeItemRenderer(treeNode)}
    </div>
  );
};
