import { TreeNode } from "./type";

export function flatTreeData(treeData: TreeNode[]): TreeNode[] {
  if (!treeData) {
    return [];
  }

  const fileTypeVal = {
    directory: 0,
    file: 1,
  };
  // 按字符串排序，目录在前面
  let list: TreeNode[] = [];
  [...treeData]
    .sort((a, b) => {
      const val = fileTypeVal[a.type] - fileTypeVal[b.type];
      if (val === 0) {
        return a.uri.localeCompare(b.uri);
      }
      return val;
    })
    .forEach((item) => {
      list.push(item);
      if (item.expanded && item.children) {
        list = list.concat(flatTreeData(item.children));
      }
    });
  return list;
}

export function calcLevel(uri: string, rootUri: string) {
  if (uri === rootUri) return 0;
  return uri.slice(rootUri.length).split("/").length;
}

export function getFileName(uri: string) {
  return uri.split("/").pop();
}

function locateTreeNode(tree: TreeNode, uri: string) {
  if (tree.uri === uri) {
    return [];
  }
  let path: number[] = [];
  const found = tree.children?.find((item, index) => {
    if (item.uri === uri) {
      path.push(index);
      return true;
    }
    const subPath = locateTreeNode(item, uri);
    if (subPath) {
      path.push(index);
      path = path.concat(subPath);
      return true;
    }
    return false;
  });
  if (found) return path;
  return null;
}

function getNodeByPath(tree: TreeNode, path: number[]): TreeNode {
  if (!path.length) {
    return tree;
  }
  const [first, ...rest] = path;
  return getNodeByPath(tree?.children?.[first] as TreeNode, rest);
}

export function updateTreeNodeProps(
  tree: TreeNode,
  uri: string,
  pairs: Partial<TreeNode>
): TreeNode {
  const path = locateTreeNode(tree, uri);
  if (!path) {
    return tree;
  }
  console.log([...path])
  let node = getNodeByPath(tree, path);
  let newNode = {
    ...node,
    ...pairs,
  };
  
  console.log(newNode);

  let index = path.pop() as number;
  while (index >= 0) {
    let parent = getNodeByPath(tree, path);
    const children = [...parent.children!];
    children.splice(index, 1, newNode);
    newNode = {
      ...parent,
      children,
    };
    index = path.pop() as number;
    console.log(newNode);
  }
  return newNode;
}
