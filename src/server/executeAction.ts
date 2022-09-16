import { FileAction } from "./FileAction";
import LocalFileService from "./LocalFileService";

async function executeAction<T extends LocalFileService = LocalFileService>(
  fileService: T,
  action: FileAction
) {
  const { type, payload } = action;
  switch (type) {
    case 'read':
      return fileService.read(payload.uri);
    case "create":
      return fileService.create(payload.uri, payload.childNode);
    case "remove":
      return fileService.remove(payload.uri);
    case "move":
      return fileService.move(payload.fromUri, payload.toUri);
    case "readdir":
      return fileService.readdir(payload.uri);
    case "rename":
      return fileService.rename(payload.uri, payload.name);
    default:
      throw new Error("unknown action");
  }
}

export default executeAction;