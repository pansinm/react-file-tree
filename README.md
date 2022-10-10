# react-file-tree

开发中...

![](./docs/appearence.png)

## Install

```bash
yarn add @sinm/react-file-tree
```

## Usage
```tsx
import { FileTree } from '@sinm/react-file-tree';

const ref = useRef();

<FileTree 
   rootUri=""
   ref={ref}
   fileService={fileService}
   onItemClick={(treeNode) => {
      // ref.current.expand(treeNode.uri, !treeNode.expanded);
   }}
/>
```

## Props
```tsx
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
```

## Demo

```
git clone https://github.com/pansinm/react-file-tree.git
cd react-file-tree
yarn
yarn start
```
