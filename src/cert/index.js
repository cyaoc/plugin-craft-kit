const fs = require("fs-extra");
const {
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
} = require("./constants");
const selfsigned = require("./selfsigned");
const current = require("./platforms").platform;

const uninstall = () => {
  current.removeFromTrustStores(rootCAPath);
  fs.removeSync(pkgDir);
};

const install = () => {
  if (!isSupported)
    throw new Error(`Platform not supported: "${process.platform}"`);

  if (!fs.existsSync(rootCAPath) && !fs.existsSync(rootCAKeyPath)) {
    const ca = selfsigned.generateCA();
    fs.outputFileSync(rootCAPath, ca.cert);
    fs.outputFileSync(rootCAKeyPath, ca.private);
    current.addToTrustStores(rootCAPath);
  }
};

const certificateFor = (requestedDomains = []) => {
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
};

module.exports = {
  uninstall,
  install,
  certificateFor,
};
