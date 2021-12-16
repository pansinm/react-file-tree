export type TreeNodeType = "directory" | "file";

export type Async = "unloaded" | "loading" | "loaded";

export interface TreeNode {
  type: TreeNodeType;
  uri: string;
  expanded?: boolean;

  /**
   * 正在重命名
   */
  renaming?: boolean;
  /**
   * 异步更新节点
   */
  async?: Async;
  children?: TreeNode[];
}

export type PromiseOrNot<T> = Promise<T> | T;

export interface TreeAction {
  /**
   * 重命名节点
   * @param uri
   */
  rename(uri: string): void;

  /**
   * 直接重命名
   * @param uri
   * @param toUri
   */
  renameTo(uri: string, toUri: string): void;

  /**
   * 展开节点
   * @param uri
   */
  expand(uri: string, expanded: boolean): void;

  /**
   * 删除节点
   */
  delete(uri: string): void;

  /**
   * 在uri节点上创建节点
   */
  create(uri: string, node: TreeNode): void;

  /**
   * 取消重命名
   */
  cancelRename(uri: string): void;

  /**
   * 移动文件或目录
   */
  move(fromUri: string, toUri: string): void;
}
