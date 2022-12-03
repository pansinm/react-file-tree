import React, { FunctionComponent } from "react";
import { TreeNode } from "../src/lib/type";
import {getClass, db, getClassWithColor } from '../github-file-icons/src/file-icons/file-icons'

import '../icons.css'

const TreeItemIcon: FunctionComponent<{ treeNode: TreeNode }> = ({
  treeNode,
}) => {
  const fileName = treeNode.uri.split('/').pop()!
  let className = '';
  if (treeNode.type === 'directory') {
    className = treeNode.expanded ? 'folder-icon-open' : 'folder-icon';
    className += ' light-folder-color'
  } else {
    const icon = db.matchName(fileName, false);
    className = getClassWithColor(fileName, icon) as string;
    if (!className) {
      className = 'file-icon light-blue'
    }
  }
  return <i style={{marginRight: 5}} className={'icon ' + className}></i>
};

export default TreeItemIcon;