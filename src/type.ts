export type TreeNodeType = "directory" | "file";

export type TreeNode<T extends {} = {}, K extends keyof T = keyof T> = {
  [x in K]: T[K];
} & {
  type: TreeNodeType;
  uri: string;
  expanded?: boolean;
  children?: TreeNode<T, K>[];
};

