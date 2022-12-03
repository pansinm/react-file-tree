import path from "path";
import { pathToFileURL } from "url";
import fs from "fs/promises";
import { TreeNode } from "./type";

export async function getTreeNodeChildren(directory: string, recursive = true) {
  let children = await fs.readdir(directory, { withFileTypes: true });
  return Promise.all(
    children.map(async (child): Promise<TreeNode> => {
      const childPath = path.resolve(directory, child.name);
      return {
        type: child.isDirectory() ? "directory" : "file",
        uri: pathToFileURL(childPath).toString(),
        children:
          child.isDirectory() && recursive
            ? await getTreeNodeChildren(childPath)
            : undefined,
      };
    })
  );
}

export async function getTreeNode(pathname: string, recursive = true): Promise<TreeNode> {
  const fullpath = path.resolve(pathname);
  const stats = await fs.stat(fullpath);
  return {
    type: stats.isDirectory() ? "directory" : "file",
    uri: pathToFileURL(fullpath).toString(),
    children: (stats.isDirectory() && recursive)
      ? await getTreeNodeChildren(fullpath)
      : undefined,
  };
}
