import React, { FC, useEffect, useRef, useState } from "react";
import { TreeHandler, TreeNode } from "src/lib/type";
import { FileTree } from "../src/lib";

import {
  Menu,
  Item,
  Separator,
  Submenu,
  useContextMenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";

const handleReadDir = (uri: string) => {
  return fetch(`/read_dir?uri=${encodeURIComponent(uri)}`).then((res) =>
    res.json()
  );
};

const MENU_ID = "context-menu";

function Input({
  value,
  onEnter,
  onBlur,
}: {
  value: string;
  onEnter: (val: string) => void;
  onBlur: () => void;
}) {
  const [val, setVal] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setVal(value);
    inputRef.current?.focus();
    const keyup = (e: any) => {
      if (e.key === "Escape") {
        inputRef?.current?.blur();
      }
    };
    document.body.addEventListener("keyup", keyup);
    return () => document.body.removeEventListener("keyup", keyup);
  }, [value]);
  return (
    <input
      ref={inputRef}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={onBlur}
      onKeyPress={(e) => {
        if (e.key === "Enter") {
          onEnter(val);
          return;
        }
      }}
    ></input>
  );
}

export const Tree: FC = () => {
  const [root, setRoot] = useState<TreeNode>();
  const currentNodeRef = useRef<TreeNode>();
  const handlerRef = useRef<TreeHandler>(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleItemClick = ({ data }: any) => {
    if (!currentNodeRef.current) {
      return;
    }
    if (data.type === "rename") {
      handlerRef.current?.renameNode(currentNodeRef.current?.uri);
    }
    if (data.type === 'delete') {
      handlerRef.current?.delete(currentNodeRef.current?.uri);
    }
  };

  useEffect(() => {
    fetch("/root")
      .then((res) => res.json())
      .then(setRoot);
  }, []);

  return (
    <>
      <FileTree
        handlerRef={handlerRef}
        root={root}
        onReadDir={handleReadDir}
        onContextMenu={(e, node) => {
          currentNodeRef.current = node;
          show(e);
        }}
        treeItemRenderer={(treeNode) => {
          const parts = treeNode.uri.split("/");
          const title = parts.pop() || "";

          if (treeNode.renaming) {
            return (
              <Input
                value={title}
                onBlur={() => handlerRef.current?.cancelRename(treeNode.uri)}
                onEnter={(val) => {
                  handlerRef.current?.renameTo(
                    treeNode.uri,
                    parts.concat(val).join("/")
                  );
                }}
              />
            );
          }
          return <div>{title}</div>;
        }}
      />

      <Menu id={MENU_ID}>
        <Item data={{ type: "rename" }} onClick={handleItemClick}>
          重命名
        </Item>
        <Item data={{ type: "delete" }} onClick={handleItemClick}>
          删除
        </Item>
        <Separator />
        <Item disabled>Disabled</Item>
      </Menu>
    </>
  );
};
