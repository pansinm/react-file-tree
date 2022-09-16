import React, { FC, useEffect, useRef, useState } from "react";
import { TreeNode } from "../src/lib/type";
import { FileTree } from "../src/lib";

import {
  Menu,
  Item,
  Separator,
  useContextMenu,
} from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import TreeItemIcon from "./TreeItemIcon";
import RenameInput from "./RenameInput";
import { FileAction } from "../src/server/FileAction";
import "./style.css";
import RemoteFileService from "./RemoteFileService";

const fileService = new RemoteFileService();

const MENU_ID = "context-menu";

type TreeHandler = React.ElementRef<typeof FileTree>;

export const Tree: FC = () => {
  const [root, setRoot] = useState<string>("");
  const currentNodeRef = useRef<TreeNode>();
  const treeRef = useRef<TreeHandler>(null);
  const { show } = useContextMenu({
    id: MENU_ID,
  });

  const handleItemClick = ({ data }: any) => {
    if (!currentNodeRef.current) {
      return;
    }
    if (data.type === "rename") {
      treeRef.current?.updateNode(currentNodeRef.current.uri, {
        renaming: true,
      });
    }
    if (data.type === "delete") {
      treeRef.current?.remove(currentNodeRef.current?.uri);
    }
  };

  useEffect(() => {
    fetch("/root")
      .then((res) => res.json())
      .then((data) => setRoot(data.uri));
  }, []);

  return (
    <>
      <FileTree
        onError={console.error}
        ref={treeRef}
        rootUri={root}
        fileService={fileService}
        onContextMenu={(e, node) => {
          currentNodeRef.current = node;
          show(e);
        }}
        onRootTreeChange={(root) => {
          if (root) {
            treeRef.current?.expand(root.uri, true);
          }
        }}
        treeItemRenderer={(treeNode) => {
          const parts = treeNode.uri.split("/");
          const title = decodeURIComponent(parts.pop() || "");

          if (treeNode.renaming) {
            return (
              <RenameInput
                value={title}
                onBlur={() => {
                  treeRef.current?.updateNode(treeNode.uri, {
                    renaming: false,
                  });
                }}
                onEnter={(val) => {
                  treeRef.current?.rename(treeNode.uri, val);
                  treeRef.current?.updateNode(treeNode.uri, {
                    renaming: false,
                  });
                }}
              />
            );
          }
          return (
            <>
              <TreeItemIcon treeNode={treeNode} />
              {title}
            </>
          );
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
