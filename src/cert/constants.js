const applicationConfigPath = require("application-config-path");
const path = require("path");
const { name } = require("../../package.json");

const ca = "root.crt";
const caKey = "root.key";

const isSupported =
  process.platform === "darwin" ||
  process.platform === "linux" ||
  process.platform === "win32";
const pkgName = name;

const pkgDir = applicationConfigPath(pkgName);
const rootCAPath = path.resolve(pkgDir, ca);
const rootCAKeyPath = path.resolve(pkgDir, caKey);

module.exports = {
  pkgName,
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
};
