const path = require("path");
const fs = require("fs-extra");
const {
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
} = require("./constants");
const selfsigned = require("./selfsigned");
const { removeFromTrustStores, addToTrustStores } =
  require("./platforms").platform;

function uninstall() {
  removeFromTrustStores(rootCAPath);
  fs.removeSync(pkgDir);
}

function install() {
  if (!isSupported) {
    throw new Error(`Platform not supported: "${process.platform}"`);
  }

  if (!fs.existsSync(rootCAPath) && !fs.existsSync(rootCAKeyPath)) {
    const ca = selfsigned.generateCA();
    fs.outputFileSync(rootCAPath, ca.cert);
    fs.outputFileSync(rootCAKeyPath, ca.private);
    addToTrustStores(rootCAPath);
  }
}

function certificateFor(requestedDomains = []) {
  install();
  const arr = Array.isArray(requestedDomains)
    ? requestedDomains
    : [requestedDomains];
  const domains = arr.filter(selfsigned.filter);
  const ca = {
    cert: fs.readFileSync(rootCAPath),
    private: fs.readFileSync(rootCAKeyPath),
  };
  const cert = selfsigned.generateBy(ca, domains);
  return cert;
}

function gen(
  requestedDomains = [],
  outputDir = process.cwd(),
  certFileName = "cert.pem",
  keyFileName = "private.pem",
) {
  const cert = certificateFor(requestedDomains);
  const certPath = path.join(outputDir, certFileName);
  const keyPath = path.join(outputDir, keyFileName);
  fs.outputFileSync(certPath, cert.cert);
  fs.outputFileSync(keyPath, cert.private);
}

module.exports = {
  uninstall,
  install,
  certificateFor,
  gen,
};
