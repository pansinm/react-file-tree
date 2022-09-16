import { TreeNode } from "../lib/type";

type Action<T, P> = {
  type: T;
  payload: P;
};

type ReadAction = Action<
  "read",
  {
    uri: string;
  }
>;

type CreateAction = Action<
  "create",
  {
    uri: string;
    childNode: TreeNode;
  }
>;

type RemoveAction = Action<
  "remove",
  {
    uri: string;
  }
>;

type MoveAction = Action<
  "move",
  {
    fromUri: string;
    toUri: string;
  }
>;

type ReadDirAction = Action<
  "readdir",
  {
    uri: string;
  }
>;

type RenameAction = Action<
  "rename",
  {
    uri: string;
    name: string;
  }
>;

export type FileAction =
  | ReadAction
  | CreateAction
  | RemoveAction
  | MoveAction
  | ReadDirAction
  | RenameAction;
