const path = require('node:path');
const fs = require('fs-extra');
const {
  rootCAPath,
  rootCAKeyPath,
  pkgDir,
  isSupported,
} = require('./constants');
const { createCA, createCert } = require('./cert');
const { removeFromTrustStores, addToTrustStores } =
  require('./platforms').platform;

function uninstall() {
  removeFromTrustStores(rootCAPath);
  fs.removeSync(pkgDir);
}

function install({
  organization = 'Developer',
  countryCode = 'CN',
  state = 'Shanghai',
  locality = 'Shanghai',
  validity = 7300,
} = {}) {
  if (!isSupported) {
    throw new Error(`Platform not supported: "${process.platform}"`);
  }

  if (!fs.existsSync(rootCAPath) && !fs.existsSync(rootCAKeyPath)) {
    const ca = createCA({
      organization,
      countryCode,
      state,
      locality,
      validity,
    });
    fs.outputFileSync(rootCAPath, ca.cert);
    fs.outputFileSync(rootCAKeyPath, ca.key);
    addToTrustStores(rootCAPath);
  }
}

function certificateFor(requestedDomains = []) {
  const validity = 7300;
  install({ validity });
  const requests = Array.isArray(requestedDomains)
    ? requestedDomains
    : [requestedDomains];
  const domains = [
    ...new Set(
      [
        'localhost',
        'localhost.localdomain',
        '127.0.0.1',
        '0.0.0.0',
        '::1',
      ].concat(requests),
    ),
  ];
  const ca = {
    cert: fs.readFileSync(rootCAPath),
    key: fs.readFileSync(rootCAKeyPath),
  };
  const cert = createCert({
    ca,
    domains,
    validity,
  });
  return cert;
}

function gen(
  requestedDomains = [],
  outputDir = process.cwd(),
  certFileName = 'public.pem',
  keyFileName = 'private.pem',
) {
  const cert = certificateFor(requestedDomains);
  const certPath = path.join(outputDir, certFileName);
  const keyPath = path.join(outputDir, keyFileName);
  fs.outputFileSync(certPath, cert.cert);
  fs.outputFileSync(keyPath, cert.key);
}

module.exports = {
  uninstall,
  install,
  certificateFor,
  gen,
};
