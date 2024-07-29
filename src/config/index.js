const fse = require("fs-extra");
const path = require("path");
const { defineConfig } = require("./define");
const { mergeDeep } = require("./merge");

function loadConfig(configFileName = "kite.config.js") {
  const configPath = path.resolve(process.cwd(), configFileName);
  let userConfig = {};
  if (fse.existsSync(configPath)) {
    userConfig = require(configPath);
  }
  return mergeDeep({}, defineConfig, userConfig);
}

module.exports = {
  loadConfig,
};
