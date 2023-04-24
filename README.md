# react-file-tree

![](./assets/appearence.png)

[Online Demo](https://codesandbox.io/s/react-file-tree-demo-yc52pj)

## Install

```bash
yarn add @sinm/react-file-tree
```

## Usage

1. Render tree

```tsx
import { FileTree } from '@sinm/react-file-tree';
// default style
import '@sinm/react-file-tree/styles.css';

const [tree, setTree] = useState(defaultTree);

<FileTree tree={tree}>
```

2. Toggle expanded

```tsx
import { utils } from "@sinm/react-file-tree";

const toggleExpanded: FileTreeProps["onItemClick"] = (treeNode) => {
  setTree((tree) =>
    utils.assignTreeNode(tree, treeNode.uri, { expanded: !treeNode.expanded })
  );
};

<FileTree tree={tree} onItemClick={toggleExpanded} />;
```

3. use [github-file-icons](https://github.com/homerchen19/github-file-icons)

```tsx
import FileItemWithFileIcon from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
// import { getFileIconClass } from '@sinm/react-file-tree/lib/FileItemWithFileIcon';
import '@sinm/react-file-tree/icons.css';
const itemRenderer = (treeNode: TreeNode) => <FileItemWithFileIcon treeNode={treeNode} />

<FileTree tree={tree} itemRenderer={itemRenderer} />
```

4. Sort tree items

```tsx
import orderBy from "lodash/orderBy";

// directory first and filename dict sort
const sorter = (treeNodes: TreeNode[]) =>
  orderBy(
    treeNodes,
    [
      (node) => (node.type === "directory" ? 0 : 1),
      (node) => utils.getFileName(node.uri),
    ],
    ["asc", "asc"]
  );

<FileTree tree={tree} sorter={sorter} />
```

5. Load tree from server

```tsx
// backend
import { getTreeNode } from "@sinm/react-file-tree/lib/node";

app.get("/root", async (req, res, next) => {
  try {
    const tree = await getTreeNode("."); // build tree for current directory
    res.send(tree);
  } catch (err) {
    next(err);
  }
});

// frontend
useEffect(() => {
  fetch("/root")
    .then((res) => res.json())
    // expand root node
    .then((tree) => Object.assign(tree, { expanded: true }))
    .then(setTree);
}, []);
```
6. activated style
```css
.file-tree__tree-item.activated {
  background: rgba(0, 0, 0, 0.1);
}
```

```tsx
<FileTree tree={tree} activatedUri={uri}>
```

## Props
1. tree: TreeNode. Below is the TreeNode type，Examples can be found at https://codesandbox.io/s/react-file-tree-demo-yc52pj?file=/src/tree.json
  ```ts
  export type TreeNodeType = "directory" | "file";

  export type TreeNode<T extends {} = {}, K extends keyof T = keyof T> = {
    [x in K]: T[K];
  } & {
    type: TreeNodeType;
    uri: string;
    expanded?: boolean;
    children?: TreeNode<T, K>[];
  };
  ```
2. activatedUri: string
3. onItemClick(treeNode: TreeNode):void
4. itemRenderer(treeNode: TreeNode): React.Element
5. sorter: (treeNodes: TreeNode[]) => TreeNode[]

## Demo

```
git clone https://github.com/pansinm/react-file-tree.git
cd react-file-tree
yarn
git submodule update --init --recursive
yarn start
```
