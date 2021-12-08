export type TreeNodeType = "directory" | "file";


export type Async = 'unloaded' | 'loading' | 'loaded';

export interface TreeNode {
  type: TreeNodeType;
  uri: string;
  expanded?: boolean;
  /**
   * 异步更新节点
   */
  async?: Async;
  children?: TreeNode[];
}

export type PromiseOrNot<T> = Promise<T> | T;
