import { FileService, TreeNode } from "../src/lib/type";
import { FileAction } from "../src/server/FileAction";

const executeAction = <T extends FileAction>(
  type: T["type"],
  payload: T["payload"]
) => {
  return fetch("/action", {
    body: JSON.stringify({ type, payload }),
    method: "post",
    headers: {
      "content-type": "application/json",
    },
  }).then((res) => res.json());
};

class RemoteFileService implements FileService {
  read(uri: string): Promise<TreeNode> {
    return executeAction("read", { uri });
  }
  readdir(uri: string): Promise<TreeNode[]> {
    return executeAction("readdir", { uri });
  }
  move(uri: string, targetDirUri: string): Promise<TreeNode> {
    return executeAction("move", { fromUri: uri, toUri: targetDirUri });
  }
  rename(uri: string, name: string): Promise<TreeNode> {
    return executeAction("rename", { uri, name });
  }
  create(uri: string, childNode: TreeNode): Promise<TreeNode> {
    return executeAction("create", { uri: uri, childNode: childNode});
  }
  remove(uri: string): Promise<void> {
    return executeAction("remove", { uri });
  }
}

export default RemoteFileService