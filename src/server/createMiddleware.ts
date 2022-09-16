import LocalFileService from "./LocalFileService";
import { RequestHandler } from 'express'
import executeAction from "./executeAction";

function createMiddleware<T extends LocalFileService = LocalFileService>(fs: T): RequestHandler {
  return async (req, res, next) => {
    try {
      res.json((await executeAction(fs, req.body)) || null);
    } catch (err) {
      next(err);
    }
  };
}

export default createMiddleware;