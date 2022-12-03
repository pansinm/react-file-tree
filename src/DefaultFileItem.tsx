import React from "react";
import FileItem from "./FileItem";
import { TreeNode } from "./type";
import { getFileName } from "./utils";

interface DefaultFileItemProps {
  treeNode: TreeNode;
}

function DefaultFileItem({ treeNode }: DefaultFileItemProps) {
  const emoji =
    treeNode.type === "directory" ? (treeNode.expanded ? "📂" : "📁") : "🗎";
  return <FileItem icon={emoji} filename={getFileName(treeNode.uri)} />;
}

export default DefaultFileItem;
