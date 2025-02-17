const path = require('node:path');
const { spawnSync } = require('node:child_process');
const logger = require('../../utils/logger');

function addToTrustStores(certPath) {
  logger.log(
    'Adding certificate to trusted store. Admin rights required. You may need to enter your password if prompted.',
  );
  spawnSync(
    'sudo',
    [
      'security',
      'add-trusted-cert',
      '-d',
      '-r',
      'trustRoot',
      '-k',
      '/Library/Keychains/System.keychain',
      '-p',
      'ssl',
      '-p',
      'basic',
      certPath,
    ],
    { stdio: 'inherit' },
  );
}

function removeFromTrustStores(certPath) {
  if (certPath) {
    logger.log(
      'Removing certificate from trusted store. Admin rights required. You may need to enter your password if prompted.',
    );
    spawnSync('sudo', ['security', 'remove-trusted-cert', '-d', certPath], {
      stdio: 'ignore',
    });
  }
}

function getApplicationConfigPath(name) {
  return path.join(process.env.HOME, 'Library', 'Application Support', name);
}

module.exports = {
  addToTrustStores,
  removeFromTrustStores,
  getApplicationConfigPath,
};
