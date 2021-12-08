import React, { CSSProperties, FC } from "react";
import { TreeNode } from "./type";

export interface TreeItemProps {
  style: CSSProperties;
  indent: number;
  indentUnit: string;
  onContextMenu: (
    treeNode: TreeNode,
    event: React.MouseEvent<HTMLDivElement>
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
}) => {
  return (
    <div
      onClick={() => onClick(treeNode)}
      style={{ ...style, paddingLeft: indent + indentUnit }}
      onContextMenu={onContextMenu.bind(null, treeNode)}
    >
      {treeItemRenderer(treeNode)}
    </div>
  );
};
