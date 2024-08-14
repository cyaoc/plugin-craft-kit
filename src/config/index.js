const fse = require("fs-extra");
const path = require("path");
const vm = require("vm");
const { merge } = require("./config");

function load(configFileName = "kite.config.js") {
  const configPath = path.resolve(process.cwd(), configFileName);
  if (fse.existsSync(configPath)) {
    const fileContent = fse.readFileSync(configPath, "utf-8");
    const script = new vm.Script(fileContent, { filename: configFileName });
    const sandbox = { module: {}, exports: {} };
    vm.createContext(sandbox);
    script.runInContext(sandbox);
    const userConfig = sandbox.module.exports || sandbox.exports || {};
    return merge(userConfig);
  }
  return merge({});
}

module.exports = {
  load,
};
