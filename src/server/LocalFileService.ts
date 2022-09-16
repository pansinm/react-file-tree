import fs from "fs/promises";
import type { FileService, TreeNode } from "../lib/type";
import url from "url";
import path from "path/posix";
import mimetypes from "mime-types";

class LocalFileService implements FileService {
  parsePath(uri: string) {
    return url.fileURLToPath(uri);
  }

  async readAsTreeNode(aPath: string) {
    const stat = await fs.stat(aPath);
    return {
      uri: url.pathToFileURL(aPath).toString(),
      mime: stat.isFile() ? mimetypes.lookup(path.basename(aPath)) : false,
      type: stat.isFile() ? "file" : "directory",
      async: stat.isDirectory() ? "unload" : undefined,
    } as TreeNode;
  }

  async read(uri: string) {
    return this.readAsTreeNode(this.parsePath(uri));
  }

  async readdir(uri: string): Promise<TreeNode[]> {
    const dir = this.parsePath(uri);
    const files = await fs.readdir(dir, { withFileTypes: true });
    return files.map((file) => {
      return {
        uri: url.pathToFileURL(path.join(dir, file.name)).toString(),
        mime: file.isFile() ? mimetypes.lookup(file.name) : false,
        type: file.isFile() ? "file" : "directory",
        async: file.isDirectory() ? "unload" : undefined,
      } as TreeNode;
    });
  }

  async move(fromUri: string, dirUri: string) {
    const from = this.parsePath(fromUri);
    const dirPath = this.parsePath(dirUri);
    const toPath = path.join(dirPath, path.basename(from))
    await fs.rename(from, toPath);
    return this.readAsTreeNode(toPath);
  }

  async rename(uri: string, name: string) {
    const fromPath = this.parsePath(uri);
    const dirname = path.dirname(fromPath);
    const toPath = path.resolve(dirname, name);
    await fs.rename(fromPath, toPath);
    return this.readAsTreeNode(toPath);
  }

  async create(uri: string, childNode: TreeNode) {
    const parentPath = this.parsePath(uri);
    const childPath = this.parsePath(childNode.uri);
    const childName = path.basename(childPath);
    const fullPath = path.join(parentPath, childName);
    if (childNode.type === "directory") {
      await fs.mkdir(fullPath);
    } else {
      await fs.writeFile(fullPath, "");
    }
    return this.readAsTreeNode(fullPath);
  }

  async remove(uri: string) {
    const path = this.parsePath(uri);
    await fs.rm(path, { recursive: true });
  }
}

export default LocalFileService;
