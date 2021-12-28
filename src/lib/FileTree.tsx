import React, {
  Dispatch,
  DispatchWithoutAction,
  FC,
  forwardRef,
  MutableRefObject,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";
import { initialState, reducer, State } from "./reducer";
import { TreeItem } from "./TreeItem";
import { PromiseOrNot, TreeHandler, TreeNode } from "./type";
import {
  addChildTo,
  calcLevel,
  flatTreeData,
  getFileName,
  getNodeByUri,
  locateTreeNode,
  mergeTreeNodeProps,
  removeNode,
  treeMap,
} from "./utils";

export interface FileTreeProps {
  handlerRef?: MutableRefObject<TreeHandler | null>;
  /**
   * 无数据时展示
   */
  emptyRenderer?: () => React.ReactElement;

  treeItemRenderer?: (treeNode: TreeNode) => React.ReactNode;

  /**
   * 读取目录，返回下一层级目录结构
   */
  onReadDir?: (dirUri: string) => PromiseOrNot<TreeNode[]>;

  /**
   * 重命名节点，失败抛异常
   */
  onRename?: (treeNode: TreeNode, toUri: string) => PromiseOrNot<void>;

  /**
   * 删除文件或目录
   */
  onDelete?: (treeNode: TreeNode) => PromiseOrNot<void>;

  /**
   * 当前节点新增目录
   */
  onNewDir?: (treeNode: TreeNode) => PromiseOrNot<TreeNode>;

  /**
   * 移动节点
   */
  onMove?: (treeNode: TreeNode, toNode: TreeNode) => PromiseOrNot<void>;

  /**
   * 构造菜单
   */
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;

  /**
   * 根节点
   */
  root?: TreeNode;

  /**
   * 子节点缩进尺寸
   */
  indent?: number;

  /**
   * 缩进单位，默认px
   */
  indentUnit?: string;
}

function useItemExpandCallback([tree, setTree, onReadDir]: [
  TreeNode | undefined,
  React.Dispatch<React.SetStateAction<TreeNode | undefined>>,
  FileTreeProps["onReadDir"]
]) {
  return useCallback(
    (
      treeNode: TreeNode,
      strategy: "toggle" | "expanded" | "collapsed" = "toggle"
    ) => {
      if (!tree) {
        return;
      }
      const map = {
        expanded: true,
        collapsed: false,
        toggle: !treeNode.expanded,
      };
      let expanded = map[strategy];
      const loadAsyncChildren = async () => {
        setTree(() =>
          mergeTreeNodeProps(tree, treeNode.uri, {
            async: "loading",
          })
        );
        const children = await onReadDir?.(treeNode.uri);
        if (children) {
          const newTree = mergeTreeNodeProps(tree, treeNode.uri, {
            async: "loaded",
            expanded: true,
            children,
          });
          setTree(() => newTree);
        }
      };

      if (treeNode.type === "directory") {
        treeNode.async === "unloaded"
          ? loadAsyncChildren()
          : setTree(
              mergeTreeNodeProps(tree, treeNode.uri, {
                expanded: expanded,
              })
            );
      }
    },
    [tree, onReadDir]
  );
}

export const FileTree: FC<FileTreeProps> = (props) => {
  const [tree, setTree] = useState<TreeNode>();
  useEffect(() => {
    setTree(props.root);
  }, [props.root]);

  const handleItemExpand = useItemExpandCallback([
    tree,
    setTree,
    props.onReadDir,
  ]);
  const actions: TreeHandler = {
    create: (uri, node) => {
      setTree((curTree) => curTree && addChildTo(curTree, uri, node));
    },
    renameNode: (uri) => {
      setTree(
        (curTree) =>
          curTree && mergeTreeNodeProps(curTree, uri, { renaming: true })
      );
    },
    renameTo: async (uri: string, toUri: string) => {
      if (!tree) {
        return;
      }
      const node = getNodeByUri(tree, uri);
      if (!node) {
        return;
      }
      await props.onRename?.(node, toUri);
      // 递归修改url
      const renamedNode = treeMap(node, (item) => {
        const newUri = item.uri.replace(uri, toUri);
        return {
          ...item,
          renaming: false,
          uri: newUri,
        };
      });
      setTree((t) => mergeTreeNodeProps(tree, uri, renamedNode));
    },
    delete: async (uri) => {
      if (!tree) {
        return;
      }
      const node = getNodeByUri(tree, uri);
      if (!node) {
        return;
      }
      await props.onDelete?.(node);
      setTree((t) => t && removeNode(t, uri));
    },
    expand: (uri, expanded) => {
      setTree((t) => t && mergeTreeNodeProps(t, uri, { expanded }));
    },
    cancelRename: (uri) =>
      setTree((t) => t && mergeTreeNodeProps(t, uri, { renaming: false })),
    move: async (fromUri, toUri) => {
      if (!tree) {
        return;
      }
      const fromNode = getNodeByUri(tree, fromUri);
      const toNode = getNodeByUri(tree, toUri);
      if (toNode?.type === "file") {
        return;
      }
      if (fromNode && toNode) {
        await props.onMove?.(fromNode, toNode);
        let finalTree = removeNode(tree, fromUri);
        // 递归修改url
        const name = fromUri.split("/").pop();
        const renamedUri = toUri + "/" + name;
        if (toNode.children?.find((node) => node.uri === renamedUri)) {
          // todo: 错误提示
          return;
        }
        const renamedNode = treeMap(fromNode, (item) => {
          const newUri = item.uri.replace(fromUri, renamedUri);
          return {
            ...item,
            renaming: false,
            uri: newUri,
          };
        });
        setTree((t) => t && addChildTo(finalTree!, toUri, renamedNode));
      }
    },
  };

  if (props.handlerRef) {
    props.handlerRef.current = actions;
  }

  const items = flatTreeData(tree ? [tree] : []);
  const rowRenderer: ListRowRenderer = (params) => {
    const treeNode = items[params.index];
    const indent = props.indent || 10;
    const treeItemRenderer =
      props.treeItemRenderer ||
      ((treeNode) => <div>{getFileName(treeNode.uri)}</div>);
    return (
      <TreeItem
        indentUnit={props.indentUnit || "px"}
        indent={indent * calcLevel(treeNode.uri, props.root?.uri || "")}
        style={params.style}
        treeNode={treeNode}
        onContextMenu={props.onContextMenu}
        treeItemRenderer={treeItemRenderer}
        onClick={handleItemExpand}
        onDragOver={(e, node) => {
          handleItemExpand(node, "expanded");
        }}
        onDrop={(e, from, to) => {
          actions.move(from, to);
        }}
      />
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          height={height}
          width={width}
          overscanRowCount={30}
          noRowsRenderer={props?.emptyRenderer}
          rowCount={items.length}
          rowHeight={30}
          rowRenderer={rowRenderer}
          // scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
};
