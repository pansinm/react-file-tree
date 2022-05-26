const fs = require("fs/promises");
const url = require("url");
const path = require("path");
const fsx = require("fs-extra");
const express = require('express')

const ROOT = path.resolve(process.env.ROOT || process.cwd());

async function readdir(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  return files.map((file) => {
    return {
      uri: url.pathToFileURL(path.join(dir, file.name)),
      type: file.isFile() ? "file" : "directory",
      async: file.isDirectory() ? "unloaded" : undefined,
    };
  });
}

const isInRoot = (filepath) => {
  console.log(filepath, ROOT);
  return (
    filepath === ROOT ||
    (filepath.startsWith(ROOT) && /\/|\\/.test(filepath[ROOT.length]))
  );
};

module.exports = function withApi(app) {
  app.use(express.json({limit: '100mb'}));
  app.use(express.urlencoded())
  app.get("/root", async (req, res, next) => {
    try {
      const uri = url.pathToFileURL(ROOT);
      res.send({
        uri,
        type: "directory",
        expanded: true,
        children: await readdir(ROOT),
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/read_dir", async (req, res, next) => {
    try {
      const dir = url.fileURLToPath(req.query.uri);
      if (!isInRoot(dir)) {
        throw new Error('Forbidden');
      }
      const data = await readdir(dir);
      res.send(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/move", async (req, res, next) => {
    try {
      const { fromUri, toUri } = req.body;
      const fromPath = url.fileURLToPath(fromUri);
      const toPath = url.fileURLToPath(toUri);
      if (!isInRoot(fromPath) || !isInRoot(toPath)) {
        throw new Error("Forbidden");
      }
      await fsx.move(fromPath, path.resolve(toPath, path.basename(fromPath)));
      res.send(await readdir(toPath));
    } catch (err) {
      next(err);
    }
  });
};
