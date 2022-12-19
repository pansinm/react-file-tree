import React, { forwardRef } from "react";
import { AutoSizer, List, ListRowProps } from "react-virtualized";
import FileItem from "./FileItem";
import { TreeItem, TreeItemProps } from "./TreeItem";
import { TreeNode } from "./type";
import { calcLevel, flatTreeData, getFileName } from "./utils";

export interface FileTreeProps {
  /**
   * 是否支持拖拽
   */
  draggable?: boolean;

  tree?: TreeNode;

  activatedUri?: string;
  /**
   * 点击条目
   */
  onItemClick?: (treeNode: TreeNode) => void;

  /**
   * 拖拽
   * @param fromUri
   * @param toDirUri
   */
  onDrop?: TreeItemProps["onDrop"];

  onDragOver?: TreeItemProps["onDragOver"];

  sorter?: (treeNodes: TreeNode[]) => TreeNode[];

  /**
   * 无数据时展示
   */
  emptyRenderer?: () => React.ReactElement;

  /**
   * 右键回调
   */
  onContextMenu?: (
    event: React.MouseEvent<HTMLDivElement>,
    treeNode: TreeNode
  ) => void;

  /**
   * 渲染节点
   */
  itemRenderer?: (treeNode: TreeNode) => React.ReactNode;

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
  return <div className="file-tree__empty">Nothing</div>;
}

function defaultItemRenderer(treeNode: TreeNode) {
  const emoji =
    treeNode.type === "directory" ? (treeNode.expanded ? "📂" : "📁") : "🗎";
  return <FileItem icon={emoji} filename={getFileName(treeNode.uri)} />;
}

export const FileTree = forwardRef<List, FileTreeProps>(
  (
    {
      tree,
      draggable,
      indent,
      rowHeight,
      indentUnit,
      onContextMenu,
      onItemClick,
      onDrop,
      onDragOver,
      emptyRenderer,
      itemRenderer,
      sorter,
      activatedUri,
    },
    ref
  ) => {
    const items = flatTreeData(tree ? [tree] : [], sorter);

    const itemRender = itemRenderer
      ? (treeNode: TreeNode) => itemRenderer?.(treeNode)
      : defaultItemRenderer;
    console.log(activatedUri);
    const rowRenderer = (params: ListRowProps) => {
      const treeNode = items[params.index];
      const indentNum = indent || 10;
      console.log(treeNode.uri === activatedUri);
      return (
        <TreeItem
          draggable={draggable}
          key={treeNode.uri}
          indentUnit={indentUnit || "px"}
          indent={indentNum * calcLevel(treeNode.uri, tree?.uri || "")}
          style={params.style}
          treeNode={treeNode}
          onContextMenu={onContextMenu}
          treeItemRenderer={itemRender}
          onClick={onItemClick}
          onDragOver={onDragOver}
          activated={treeNode.uri === activatedUri}
          onDrop={onDrop}
        />
      );
    };

    return (
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={ref}
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
