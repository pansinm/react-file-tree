import React from "react";
import { db, getClassWithColor } from "./file-icons/file-icons";
import FileItem from "./FileItem";
import { TreeNode } from "./type";
import { getFileName } from "./utils";

interface FileItemWithFileIconProps {
  treeNode: TreeNode;
}

function getClass(fileName: string, isDirectory: boolean, expanded?: boolean) {
  let className = "";
  if (isDirectory) {
    className = expanded ? "folder-icon-open" : "folder-icon";
    className += " light-folder-color";
  } else {
    const icon = db.matchName(fileName, false);
    className = getClassWithColor(fileName, icon) as string;
    if (!className) {
      className = "file-icon light-blue";
    }
  }
  return className;
}

function FileItemWithFileIcon({ treeNode }: FileItemWithFileIconProps) {
  const filename = getFileName(treeNode.uri);
  const iconClass = getClass(
    filename,
    treeNode.type === "directory",
    treeNode.expanded
  );
  return (
    <FileItem icon={<span className={iconClass}></span>} filename={filename} />
  );
}

export default FileItemWithFileIcon;
