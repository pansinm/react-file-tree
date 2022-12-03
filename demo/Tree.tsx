import React, { FC, useEffect, useState } from "react";
import orderBy from "lodash/orderBy";
import { FileTree, FileTreeProps, TreeNode, utils } from "../src";
import FileItemWithFileIcon from "../src/FileItemWithFileIcon";

const sorter = (treeNodes: TreeNode[]) =>
  orderBy(
    treeNodes,
    [
      (node) => (node.type === "directory" ? 0 : 1),
      (node) => utils.getFileName(node.uri),
    ],
    ["asc", "asc"]
  );

export const Tree: FC<{ iconType: "emoji" | "file-icon" }> = ({ iconType }) => {
  const [tree, setTree] = useState<TreeNode | undefined>();

  useEffect(() => {
    fetch("/root")
      .then((res) => res.json())
      .then((tree) => Object.assign(tree, { expanded: true }))
      .then(setTree);
  }, []);

  const toggleExpanded: FileTreeProps["onItemClick"] = (treeNode) => {
    setTree((tree) =>
      utils.assignTreeNode(tree, treeNode.uri, {
        expanded: !treeNode.expanded,
      })
    );
  };
  const itemRender =
    iconType === "file-icon"
      ? (treeNode: TreeNode) => <FileItemWithFileIcon treeNode={treeNode} />
      : undefined;
  return (
    <FileTree
      itemRenderer={itemRender}
      tree={tree}
      onItemClick={toggleExpanded}
      sorter={sorter}
    />
  );
};
