#!/usr/bin/env node
const { program } = require("commander");
const { version, description } = require("../../package.json");
const cert = require("../cert");

program.version(version, "-v, --version").description(description);
program
  .command("cert")
  .description("Generate development certificate")
  .option("-i, --install", "Install CA certificate")
  .option("-u, --uninstall", "Uninstall the CA certificate")
  .action((options) => {
    if (options.install) {
      cert.install();
    } else if (options.uninstall) cert.uninstall();
  });
program.parse(process.argv);
