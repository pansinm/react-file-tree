import React, { FC, useEffect, useState } from "react";
import { TreeNode } from "src/lib/type";
import { FileTree } from "../src/lib";

const handleReadDir = (uri: string) => {
  return fetch(`/read_dir?uri=${encodeURIComponent(uri)}`).then((res) =>
    res.json()
  );
};
export const Tree: FC = () => {
  const [root, setRoot] = useState<TreeNode>();
  useEffect(() => {
    fetch("/root")
      .then((res) => res.json())
      .then(setRoot);
  }, []);
  return <FileTree root={root} onReadDir={handleReadDir} />;
};
