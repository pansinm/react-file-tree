import {
  useMemo,
  useState,
} from "react";
import { FileService, TreeNode } from "./type";
import useEvent from "./useEvent";
import {
  addChildTo,
  getNodeByUri,
  mergeTreeNodeProps,
  removeNode as _removeNode,
  replaceTreeNode,
} from "./utils";

function useTree(fileService: FileService, onError?: (err: Error) => void) {
  const [tree, setTree] = useState<TreeNode>();

  // 修改节点
  const updateNode = useEvent((uri: string, record: Partial<TreeNode>) => {
    setTree((t) => mergeTreeNodeProps(t, uri, record));
  });

  const getRootNode = useEvent(() => tree);


  const getNode = useEvent((uri: string) => getNodeByUri(tree, uri));

  // 展开节点
  const expand = useEvent(async (uri: string, expanded: boolean) => {
    const treeNode = getNode(uri);
    if (treeNode?.type !== "directory" || treeNode.async === "loading") {
      return;
    }
    if (treeNode?.async === "unload") {
      updateNode(uri, { async: "loading" });
      try {
        const children = await fileService.readdir(treeNode.uri);
        setTree((t) =>
          mergeTreeNodeProps(t, uri, {
            async: "loaded",
            expanded,
            children,
          })
        );
      } catch (err) {
        updateNode(uri, { async: "unload" });
        onError?.(err as Error);
      }
    } else {
      setTree((t) => mergeTreeNodeProps(t, uri, { expanded }));
    }
  });

  // 替换节点
  const replaceNode = useEvent((uri: string, replacedNode: TreeNode) => {
    setTree((t) => replaceTreeNode(t, uri, replacedNode));
  });

  // 增加节点
  const addNode = useEvent((uri: string, childNode: TreeNode) => {
    setTree((t) => addChildTo(t, uri, childNode));
  });

  const removeNode = useEvent((uri: string) => {
    setTree((t) => _removeNode(t, uri));
  });

  const rename = useEvent(async (uri: string, name: string) => {
    try {
      const treeNode = await fileService.rename(uri, name);
      replaceNode(uri, treeNode);
    } catch (err) {
      onError?.(err as Error);
    }
  });

  // 删除节点
  const remove = useEvent(async (uri: string) => {
    try {
      await fileService.remove(uri);
      setTree((t) => {
        console.log(t, uri);
        return _removeNode(t, uri);
      });
    } catch (err) {
      onError?.(err as Error);
    }
  });

  const create = useEvent(async (uri: string, childNode: TreeNode) => {
    try {
      const node = await fileService.create(uri, childNode);
      const finalTree = _removeNode(tree, childNode.uri);
      setTree(() => addChildTo(finalTree, uri, childNode));
    } catch (err) {
      onError?.(err as Error);
    }
  });

  const move = useEvent(async (uri: string, targetDirUri: string) => {
    try {
      const treeNode = await fileService.move(uri, targetDirUri);
      setTree((t) => {
        const finalTree = _removeNode(t, uri);
        return addChildTo(finalTree, targetDirUri, treeNode);
      });
    } catch (err) {
      onError?.(err as Error);
    }
  });

  const handler = useMemo(
    () => ({
      getRootNode,
      setRootNode: setTree,
      getNode,
      addNode,
      replaceNode,
      updateNode,
      removeNode,
      expand,
      create,
      rename,
      remove,
      move,
    }),
    []
  );
  return [tree, handler] as const;
}

export default useTree;