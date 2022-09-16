export type TreeNodeType = "directory" | "file";

export type Async = "unload" | "loading" | "loaded";

export interface FileService {
  read(uri: string): Promise<TreeNode>;
  readdir(uri: string): Promise<TreeNode[]>;
  move(uri: string, targetDirUri: string): Promise<TreeNode>;
  rename(uri: string, name: string): Promise<TreeNode>;
  create(dirUri: string, node: TreeNode): Promise<TreeNode>
  remove(uri: string): Promise<void>;
}


export interface TreeNode {
  type: TreeNodeType;
  uri: string;
  mime?: string;
  expanded?: boolean;
  /**
   * 异步更新节点
   */
  async?: Async;
  children?: TreeNode[];

  // other props
  [x: string]: any;
}

export type PromiseOrNot<T> = Promise<T> | T;

export interface TreeHandler {
  /**
   * 重命名节点
   * @param uri
   */
  executeToRename(uri: string): void;

  /**
   * 直接重命名
   * @param uri
   * @param toUri
   */
  executeRenameTo(uri: string, toUri: string): void;

  /**
   * 展开节点
   * @param uri
   */
  executeExpand(uri: string, expanded: boolean): void;

  /**
   * 删除节点
   */
  executeDelete(uri: string): void;

  /**
   * 在uri节点上创建节点
   */
  executeCreate(uri: string, node: TreeNode): void;

  /**
   * 取消重命名
   */
  executeCancelRename(uri: string): void;

  /**
   * 
   */
  executeDrop(fromUri: string, toUri: string): void;
}
