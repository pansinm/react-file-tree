import React, { FunctionComponent } from "react";
import { TreeNode } from "../src/lib/type";
import Icon from "./Icon";

const TreeItemIcon: FunctionComponent<{ treeNode: TreeNode }> = ({
  treeNode,
}) => {
  if (treeNode.type === "directory") {
    return <Icon type={treeNode.expanded ? "folder2-open" : "folder2"} color="orange" />;
  }
  const isImage = /image/.test(treeNode.mime);
  return <Icon type={isImage ? 'file-image' : 'file-text-fill'} color="green"/>
};

export default TreeItemIcon;