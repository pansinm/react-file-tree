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


## Demo

```
git clone https://github.com/pansinm/react-file-tree.git
cd react-file-tree
yarn
yarn start
```
