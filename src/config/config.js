const _ = require("lodash");

const defineConfig = {
  options: {
    dir: ".kite",
  },
  esbuild: {
    entryPoints: ["index.js"],
    format: "iife",
    bundle: true,
    outdir: "dist",
  },
};

function merge(user = {}) {
  return _.merge({}, defineConfig, user);
}

module.exports = { merge };
