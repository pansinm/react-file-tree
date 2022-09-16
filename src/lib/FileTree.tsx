import React, {
  forwardRef,
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import { TreeItem, TreeItemProps } from "./TreeItem";
import { FileService, TreeHandler, TreeNode } from "./type";
import useEvent from "./useEvent";
import useTree from "./useTree";
import {
  calcLevel,
  flatTreeData,
  getFileName,
  getParentNode,
  removeNode as _removeNode,
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
  treeItemRenderer?: (treeNode: TreeNode) => React.ReactNode;

  /**
   * 过滤特定节点，如果返回false，列表中不显示
   */
  doFilter?: (treeNode: TreeNode) => boolean;

  onTreeItemClick?: (treeNode: TreeNode) => void;

  rootUri?: string;

  /**
   * 构造菜单
   */
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;

  fileService: FileService;
  /**
   * 根节点
   */
  root?: TreeNode;

  onError?: (err: Error) => void;

  onRootTreeChange?: (root: TreeNode | undefined) => void;

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

export const FileTree = forwardRef<
  ReturnType<typeof useTree>["1"],
  FileTreeProps
>(
  (
    {
      rootUri,
      fileService,
      emptyRenderer,
      treeItemRenderer,
      onError,
      doFilter,
      indent,
      rowHeight,
      indentUnit,
      onContextMenu,
      onRootTreeChange,
      onTreeItemClick,
    },
    ref
  ) => {
    const [tree, handler] = useTree(fileService, onError);
    // 初始化tree
    useEffect(() => {
      if (!rootUri) {
        handler.setRootNode(undefined);
        onRootTreeChange?.(undefined);
      } else {
        fileService
          .read(rootUri)
          .then((treeNode) => {
            handler?.setRootNode(treeNode);
            onRootTreeChange?.(treeNode);
          })
          .catch(onError);
      }
    }, [rootUri]);

    const items = flatTreeData(tree ? [tree] : []).filter((item) =>
      doFilter ? doFilter(item) : true
    );

    const handleClick: TreeItemProps["onClick"] = useEvent((treeNode) => {
      if (onTreeItemClick) {
        onTreeItemClick(treeNode);
        return;
      }
      if (treeNode.type === "directory") {
        handler.expand(treeNode.uri, !treeNode.expanded);
      }
    });

    const itemRender = treeItemRenderer
      ? (treeNode: TreeNode) => treeItemRenderer?.(treeNode)
      : (treeNode: TreeNode) => <div>{getFileName(treeNode.uri)}</div>;

    // 悬停时展开目录
    const timeoutRef = useRef(0);
    const handleDragOver: TreeItemProps["onDragOver"] = useEvent(
      (event: React.DragEvent<HTMLDivElement>, treeNode: TreeNode) => {
        clearTimeout(timeoutRef.current);
        if (treeNode.type === "directory" && !treeNode.expanded) {
          // 延时一点展开目录或者收缩目录，防止误操作
          timeoutRef.current = window.setTimeout(() => {
            handler.expand(treeNode.uri, true);
          }, 500);
        }
      }
    );

    // 移动文件
    const handleDrop = useEvent(
      async (
        event: React.DragEvent<HTMLDivElement>,
        fromUri: string,
        toUri: string
      ) => {
        const fromNode = handler.getNode(fromUri);
        let toNode = handler.getNode(toUri);
        if (!fromNode || !toNode) {
          return;
        }
        if (toNode.type !== "directory") {
          toNode = getParentNode(tree, toNode.uri);
        }
        if (toNode?.type === "directory") {
          handler.move(fromUri, toNode.uri);
        }
      }
    );

    useImperativeHandle(
      ref,
      () => {
        return handler;
      },
      []
    );

    const rowRenderer = (params: ListRowProps) => {
      const treeNode = items[params.index];
      const indentNum = indent || 10;

      return (
        <TreeItem
          key={treeNode.uri}
          indentUnit={indentUnit || "px"}
          indent={indentNum * calcLevel(treeNode.uri, rootUri || "")}
          style={params.style}
          treeNode={treeNode}
          onContextMenu={onContextMenu}
          treeItemRenderer={itemRender}
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      );
    };

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            className="file-tree"
            height={height}
            width={width}
            overscanRowCount={30}
            noRowsRenderer={emptyRenderer || defaultEmptyRenderer}
            rowCount={items.length}
            rowHeight={rowHeight || 30}
            rowRenderer={rowRenderer}
            // scrollToIndex={scrollToIndex}
          />
        )}
      </AutoSizer>
    );
  }
);
