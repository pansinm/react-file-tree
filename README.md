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

<FileTree 
   rootUri=""
   fileService={fileService}
   onItemClick={(treeNode, tree) => {

   }}
   onDrop={(fromNode, toNode, tree) => {

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
