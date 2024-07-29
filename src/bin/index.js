#!/usr/bin/env node
const { program } = require("commander");
const { version, description } = require("../../package.json");
const cert = require("../cert");

program.version(version, "-v, --version").description(description);
const certCommand = program
  .command("cert")
  .description("Manage self-signed CA certificates");
certCommand
  .command("install")
  .description("Install the self-signed CA certificate into the trusted store")
  .action(() => {
    cert.install();
  });
certCommand
  .command("uninstall")
  .description(
    "Uninstall the self-signed CA certificate from the trusted store",
  )
  .action(() => {
    cert.uninstall();
  });
certCommand
  .command("gen [domains...]")
  .description("Generate a new self-signed CA certificate")
  .option(
    "-o, --output-dir <path>",
    "Output directory for the certificate and key",
  )
  .option("-c, --cert-file <filename>", "Certificate file name")
  .option("-k, --key-file <filename>", "Private key file name")
  .action((domains, options) => {
    cert.gen(domains, options.outputDir, options.certFile, options.keyFile);
  });
program.parse(process.argv);
