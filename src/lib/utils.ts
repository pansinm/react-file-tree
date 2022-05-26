import { Children } from "react";
import { TreeNode } from "./type";

/**
 * 将树转换成列表
 * @param treeData
 * @returns
 */
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

/**
 * 计算层级
 * @param uri
 * @param rootUri
 * @returns
 */
export function calcLevel(uri: string, rootUri: string) {
  if (uri === rootUri) return 0;
  return uri.slice(rootUri.length).split("/").length;
}

/**
 * 根据uri获取文件名
 * @param uri
 * @returns
 */
export function getFileName(uri: string) {
  return uri.split("/").pop();
}

/**
 * 根据uri获取节点路径
 * @param tree
 * @param uri
 * @returns
 */
export function locateTreeNode(tree: TreeNode, uri: string) {
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

/**
 * 根据子节点路径定位节点
 * @param tree
 * @param path
 * @returns
 */
function getNodeByPath(tree: TreeNode, path: number[]): TreeNode {
  if (!path.length) {
    return tree;
  }
  const [first, ...rest] = path;
  return getNodeByPath(tree?.children?.[first] as TreeNode, rest);
}

/**
 * 根据uri查询节点
 * @param tree
 * @param uri
 * @returns
 */
export function getNodeByUri(tree: TreeNode, uri: string) {
  const path = locateTreeNode(tree, uri);
  if (!path) {
    return null;
  }
  return getNodeByPath(tree, path);
}

/**
 * 获取父节点
 * @param tree 
 * @param uri 
 * @returns 
 */
export function getParentNode(tree: TreeNode, uri: string) {
  const path = locateTreeNode(tree, uri);
  if (!path) {
    return null;
  }
  path.pop();
  return getNodeByPath(tree, path);
}

export function isParentUri(curUri: string, parentUri: string) {
  return curUri.startsWith(parentUri) && curUri[parentUri.length] === '/';
}

/**
 * 更新节点属性，并返回新的树
 * @param tree
 * @param uri
 * @param pairs
 * @returns
 */
export function mergeTreeNodeProps(
  tree: TreeNode,
  uri: string,
  pairs: Partial<TreeNode>
): TreeNode {
  const path = locateTreeNode(tree, uri);
  if (!path) {
    return tree;
  }
  let node = getNodeByPath(tree, path);
  let newNode = {
    ...node,
    ...pairs,
  };

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
  }
  return newNode;
}

/**
 * 为节点增加子节点
 * @param tree
 * @param parentUri
 * @param node
 * @returns
 */
export function addChildTo(tree: TreeNode, parentUri: string, node: TreeNode) {
  const path = locateTreeNode(tree, parentUri);
  if (!path) {
    return tree;
  }
  let locatedNode = getNodeByPath(tree, path);
  if (locatedNode?.children?.find((n) => n.uri === node.uri)) {
    console.warn("重复uri");
    return tree;
  }
  const children = [...(locatedNode.children || []), node];
  return mergeTreeNodeProps(tree, parentUri, { children });
}

/**
 * 从树中删除某节点
 * @param tree
 * @param uri
 * @returns
 */
export function removeNode(tree: TreeNode, uri: string) {
  const path = locateTreeNode(tree, uri);
  if (!path) {
    return tree;
  }
  // 删除根节点
  if (!path.length) {
    return undefined;
  }
  const index = path.pop() as number;
  const parentPath = path;
  const parent = getNodeByPath(tree, parentPath);
  const children = [...(parent.children || [])];
  children.splice(index, 1);
  return mergeTreeNodeProps(tree, parent.uri, { children });
}

/**
 * 遍历树，生成新的树，叶子节点优先遍历
 * @param tree
 * @param fn
 * @returns
 */
export function treeMap(
  tree: TreeNode,
  fn: (treeNode: TreeNode) => TreeNode
): TreeNode {
  if (tree.children) {
    return fn({
      ...tree,
      children: tree.children.map((node) => fn(node)),
    });
  }
  return fn(tree);
}
