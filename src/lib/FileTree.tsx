import React, {
  FC,
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { TreeItem } from "./TreeItem";
import { PromiseOrNot, TreeHandler, TreeNode } from "./type";
import useEvent from "./useEvent";
import {
  addChildTo,
  calcLevel,
  flatTreeData,
  getFileName,
  getNodeByUri,
  getParentNode,
  isParentUri,
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

  /**
   * 渲染节点
   */
  treeItemRenderer?: (treeNode: TreeNode, tree: TreeHandler) => React.ReactNode;

  /**
   * 如果传入onChange，组件变成受控组件
   */
  onChange?: (root?: TreeNode) => void;

  /**
   * 读取目录，返回下一层级目录结构
   */
  doReadDir?: (dirUri: string, tree: TreeHandler) => PromiseOrNot<TreeNode[]>;

  /**
   * 重命名节点，失败抛异常
   */
  doRename?: (
    treeNode: TreeNode,
    toUri: string,
    tree: TreeHandler
  ) => PromiseOrNot<void>;

  /**
   * 删除文件或目录
   */
  doDelete?: (treeNode: TreeNode, tree: TreeHandler) => PromiseOrNot<void>;

  /**
   * 为父节点新增子节点
   */
  doNew?: (
    parentNode: TreeNode,
    childNode: TreeNode,
    tree: TreeHandler
  ) => PromiseOrNot<TreeNode>;

  /**
   * 移动节点
   */
  doMove?: (
    treeNode: TreeNode,
    toNode: TreeNode,
    tree: TreeHandler
  ) => PromiseOrNot<TreeNode[]>;

  /**
   * 过滤特定节点，如果返回false，列表中不显示
   */
  doFilter?: (treeNode: TreeNode) => boolean;

  onTreeItemClick?: (treeNode: TreeNode) => void;

  /**
   * 拖拽事件
   */
  onDrop?: (
    event: React.DragEvent<HTMLDivElement>,
    fromUri: string,
    toUri: string,
    tree: TreeHandler
  ) => void;

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
   *  节点高度，默认30
   */
  rowHeight?: number;
  /**
   * 缩进单位，默认px
   */
  indentUnit?: string;
}

function defaultEmptyRenderer() {
  return <div className="file-tree__empty">无内容</div>;
}

function useItemExpandCallback([tree, setTree, doReadDir, treeHandler]: [
  TreeNode | undefined,
  React.Dispatch<React.SetStateAction<TreeNode | undefined>>,
  FileTreeProps["doReadDir"],
  TreeHandler
]) {
  return useEvent(
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
        const children = await doReadDir?.(treeNode.uri, treeHandler);
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
    }
  );
}

export const FileTree: FC<FileTreeProps> = (props) => {
  const [tree, setTree] = useState<TreeNode>();
  useEffect(() => {
    setTree(props.root);
  }, [props.root]);

  const listRef = useRef<List>(null);
  const timeoutRef = useRef(0);

  const executeDrop = useEvent(async (fromUri: string, toUri: string) => {
    clearTimeout(timeoutRef.current);
    if (!tree) {
      return;
    }
    const fromNode = getNodeByUri(tree, fromUri);
    if (!fromNode) {
      return;
    }
    let toNode = getNodeByUri(tree, toUri);
    if (toNode?.type === "file") {
      toNode = getParentNode(tree, toNode.uri);
    }
    if (!toNode) {
      return;
    }
    if (fromNode.uri === toNode.uri || isParentUri(toNode.uri, fromNode.uri)) {
      return;
    }

    const toNodeChildren = await props.doMove?.(fromNode, toNode, treeHandler);
    let finalTree = removeNode(tree, fromUri);
    handleTreeChange(
      (t) =>
        t &&
        mergeTreeNodeProps(finalTree!, toNode?.uri as string, {
          expanded: true,
          children: toNodeChildren,
        })
    );
  });

  const items = flatTreeData(tree ? [tree] : []).filter((item) =>
    props.doFilter ? props.doFilter(item) : true
  );

  const handleTreeChange: typeof setTree = useCallback(
    (newTree) => {
      if (props.onChange) {
        const finalTree =
          typeof newTree === "function" ? newTree(tree) : newTree;
        props.onChange(finalTree);
      } else {
        setTree(newTree);
      }
    },
    [setTree, props.onChange]
  );

  const treeHandler: TreeHandler = {
    executeCreate: async (uri, node) => {
      if (!tree) {
        return;
      }
      const parentNode = getNodeByUri(tree, uri);
      if (!parentNode) return;
      await props?.doNew?.(parentNode, node, treeHandler);
      handleTreeChange((curTree) => curTree && addChildTo(curTree, uri, node));
    },
    executeToRename: (uri) => {
      handleTreeChange(
        (curTree) =>
          curTree && mergeTreeNodeProps(curTree, uri, { renaming: true })
      );
    },
    executeRenameTo: async (uri: string, toUri: string) => {
      if (!tree) {
        return;
      }
      const node = getNodeByUri(tree, uri);
      if (!node) {
        return;
      }
      await props.doRename?.(node, toUri, treeHandler);
      // 递归修改url
      const renamedNode = treeMap(node, (item) => {
        const newUri = item.uri.replace(uri, toUri);
        return {
          ...item,
          renaming: false,
          uri: newUri,
        };
      });
      handleTreeChange((t) => mergeTreeNodeProps(tree, uri, renamedNode));
    },
    executeDelete: async (uri) => {
      if (!tree) {
        return;
      }
      const node = getNodeByUri(tree, uri);
      if (!node) {
        return;
      }
      await props.doDelete?.(node, treeHandler);
      handleTreeChange((t) => t && removeNode(t, uri));
    },
    executeExpand: (uri, expanded) => {
      handleTreeChange((t) => t && mergeTreeNodeProps(t, uri, { expanded }));
    },
    executeCancelRename: (uri) =>
      handleTreeChange(
        (t) => t && mergeTreeNodeProps(t, uri, { renaming: false })
      ),
    executeDrop,
  };

  const handleItemExpand = useItemExpandCallback([
    tree,
    handleTreeChange,
    props.doReadDir,
    treeHandler,
  ]);

  if (props.handlerRef) {
    props.handlerRef.current = treeHandler;
  }

  const handleDrop = useEvent(
    (
      event: React.DragEvent<HTMLDivElement>,
      fromUri: string,
      toUri: string
    ) => {
      if (!props.onDrop) {
        event.preventDefault();
        return;
      }
      return props.onDrop(event, fromUri, toUri, treeHandler);
    }
  );

  const treeItemRenderer = props.treeItemRenderer
    ? (treeNode: TreeNode) => props.treeItemRenderer?.(treeNode, treeHandler)
    : (treeNode: TreeNode) => <div>{getFileName(treeNode.uri)}</div>;

  const rowRenderer = (params: ListRowProps) => {
    const treeNode = items[params.index];
    const indent = props.indent || 10;

    return (
      <TreeItem
        key={treeNode.uri}
        indentUnit={props.indentUnit || "px"}
        indent={indent * calcLevel(treeNode.uri, props.root?.uri || "")}
        style={params.style}
        treeNode={treeNode}
        onContextMenu={props.onContextMenu}
        treeItemRenderer={treeItemRenderer}
        onClick={props.onTreeItemClick || handleItemExpand}
        onDragOver={(e, node) => {
          clearTimeout(timeoutRef.current);
          // 延时一点展开目录或者收缩目录，防止误操作
          timeoutRef.current = window.setTimeout(() => {
            handleItemExpand(node, "expanded");
          }, 500);
        }}
        onDrop={handleDrop}
      />
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          className="file-tree"
          height={height}
          width={width}
          overscanRowCount={30}
          noRowsRenderer={props.emptyRenderer || defaultEmptyRenderer}
          rowCount={items.length}
          rowHeight={props.rowHeight || 30}
          rowRenderer={rowRenderer}
          // scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
};
