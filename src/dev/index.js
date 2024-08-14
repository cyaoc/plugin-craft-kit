const esbuild = require("esbuild");
const { load } = require("../config");

async function start() {
  const { esbuild: config } = load();

  const ctx = await esbuild.context(config);

  await ctx.watch();

  const { host, port } = await ctx.serve({
    servedir: "dist",
    keyfile: "private.pem",
    certfile: "cert.pem",
  });
}

module.exports = {
  start,
};
