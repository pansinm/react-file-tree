const fs = require("fs/promises");
const url = require("url");
const path = require("path");

async function readdir(uri) {
  var dir = url.fileURLToPath(uri);
  const files = await fs.readdir(dir, { withFileTypes: true });
  return files.map((file) => {
    return {
      uri: url.pathToFileURL(path.join(dir, file.name)),
      type: file.isFile() ? "file" : "directory",
      async: file.isDirectory() ? "unloaded" : undefined,
    };
  });
}

module.exports = function withApi(app) {
  app.get("/root", async (req, res, next) => {
    try {
      const uri = url.pathToFileURL(process.cwd());
      res.send({
        uri,
        type: "directory",
        expanded: true,
        children: await readdir(uri),
      });
    } catch (error) {
      next(error);
    }
  });
  app.get("/read_dir", (req, res, next) => {
    readdir(req.query.uri)
      .then((data) => res.send(data))
      .catch(next);
  });
};
