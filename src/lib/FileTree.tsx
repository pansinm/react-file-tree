import React, {
  Dispatch,
  DispatchWithoutAction,
  FC,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { AutoSizer, List, ListRowRenderer } from "react-virtualized";
import { initialState, reducer, State } from "./reducer";
import { TreeItem } from "./TreeItem";
import { PromiseOrNot, TreeNode } from "./type";
import {
  calcLevel,
  flatTreeData,
  getFileName,
  updateTreeNodeProps,
} from "./utils";

export interface FileTreeProps {
  /**
   * 无数据时展示
   */
  EmptyRenderer?: () => React.ReactElement;

  /**
   * 读取目录，返回下一层级目录结构
   */
  onReadDir?: (dirUri: string) => PromiseOrNot<TreeNode[]>;

  /**
   * 重命名节点，失败抛异常
   */
  onRename?: (treeNode: TreeNode) => PromiseOrNot<void>;

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
    event: MouseEvent,
    treeNode: TreeNode,
    dispatch: React.Dispatch<any>
  ) => PromiseOrNot<void>;

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

export const FileTree: FC<FileTreeProps> = (props) => {
  const [tree, setTree] = useState<TreeNode>();

  useEffect(() => {
    setTree(props.root);
  }, [props.root]);

  const items = flatTreeData(tree ? [tree] : []);

  const handleItemClick = useCallback(
    (treeNode: TreeNode) => {
      if (!tree) {
        return;
      }

      const loadAsyncChildren = async () => {
        setTree(() =>
          updateTreeNodeProps(tree, treeNode.uri, {
            async: "loading",
          })
        );
        const children = await props.onReadDir?.(treeNode.uri);
        if (children) {
          const newTree = updateTreeNodeProps(tree, treeNode.uri, {
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
              updateTreeNodeProps(tree, treeNode.uri, {
                expanded: !treeNode.expanded,
              })
            );
      }
    },
    [tree]
  );

  const rowRenderer: ListRowRenderer = (params) => {
    const treeNode = items[params.index];
    const indent = props.indent || 10;
    return (
      <TreeItem
        indentUnit={props.indentUnit || "px"}
        indent={indent * calcLevel(treeNode.uri, props.root?.uri || "")}
        style={params.style}
        treeNode={treeNode}
        onContextMenu={() => {}}
        treeItemRenderer={(treeNode) => <div>{getFileName(treeNode.uri)}</div>}
        onClick={handleItemClick}
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
          noRowsRenderer={props?.EmptyRenderer}
          rowCount={items.length}
          rowHeight={30}
          rowRenderer={rowRenderer}
          // scrollToIndex={scrollToIndex}
        />
      )}
    </AutoSizer>
  );
};
