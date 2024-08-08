const path = require("path");
const { name: pkgName } = require("../../package.json");
const { getApplicationConfigPath } = require("./platforms").platform;

const ca = "rootCA.pem";
const caKey = "rootCA-key.pem";

const isSupported =
  process.platform === "darwin" ||
  process.platform === "linux" ||
  process.platform === "win32";

const pkgDir = getApplicationConfigPath(pkgName);
const rootCAPath = path.resolve(pkgDir, ca);
const rootCAKeyPath = path.resolve(pkgDir, caKey);

module.exports = {
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
};
