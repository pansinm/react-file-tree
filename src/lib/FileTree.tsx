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

  /**
   * 点击条目
   */
  onTreeItemClick?: (treeNode: TreeNode) => void;

  /**
   * 打开的目录URI
   */
  rootUri?: string;

  /**
   * 是否支持拖拽
   */
  draggable?: boolean;

  /**
   * 拖拽
   * @param fromUri 
   * @param toDirUri 
   */
  onDrop?(fromUri: string, toDirUri: string): void;

  /**
   * 右键回调
   */
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;

  /**
   * 文件服务，
   */
  fileService: FileService;

  /**
   * 出错时回调
   */
  onError?: (err: Error) => void;

  /**
   * 目录内文件排序方法
   */
  treeItemSort?: (treeNodes: TreeNode[]) => TreeNode[];

  /**
   * 根目录变化回调
   */
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
      treeItemSort,
      onError,
      draggable,
      doFilter,
      indent,
      rowHeight,
      indentUnit,
      onContextMenu,
      onDrop,
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

    const items = flatTreeData(tree ? [tree] : [], treeItemSort).filter(
      (item) => (doFilter ? doFilter(item) : true)
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
        if (fromUri === toUri) {
          return;
        }
        const fromNode = handler.getNode(fromUri);
        let toNode = handler.getNode(toUri);
        if (!fromNode || !toNode) {
          return;
        }
        if (toNode.type !== "directory") {
          toNode = getParentNode(tree, toNode.uri);
        }
        if (toNode?.type === "directory") {
          if (onDrop) {
            onDrop(fromUri, toNode.uri);
          } else {
            handler.move(fromUri, toNode.uri);
          }
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
          draggable={draggable}
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
