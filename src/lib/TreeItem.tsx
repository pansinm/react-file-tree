import React, { CSSProperties, FC, memo } from "react";
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

export const TreeItem: FC<TreeItemProps> = memo(({
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
      className="file-tree__tree-item"
      title={treeNode.uri}
      draggable={true}
      onDrop={(e) => {
        e.preventDefault();
        e.currentTarget.style.backgroundColor = "#fff";
        const from = e.dataTransfer.getData("text/plain");
        const to = treeNode.uri;
        onDrop?.(e, from, to);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver?.(e, treeNode);
        e.currentTarget.classList.add("file-tree__tree-item--dragover");
      }}
      onDragEnter={(e) => {
        e.currentTarget.classList.add("file-tree__tree-item--dragover");
      }}
      onDragLeave={(e) => {
        e.currentTarget.classList.remove("file-tree__tree-item--dragover");
      }}
      onDragStart={(e) => {
        // e.dataTransfer.dropEffect = "move";
        e.dataTransfer.setData("text/plain", treeNode.uri);
      }}
      onClick={() => onClick(treeNode)}
      style={{
        whiteSpace: "nowrap",
        ...style,
        paddingLeft: indent + indentUnit,
      }}
      onContextMenu={(e) => onContextMenu?.(e, treeNode)}
    >
      {treeItemRenderer(treeNode)}
    </div>
  );
});
