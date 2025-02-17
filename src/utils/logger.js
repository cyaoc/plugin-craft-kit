const { projectName } = require('../common/constants');

function createLogger(prefix = projectName) {
  return {
    log: (...args) => console.log(`[${prefix}]`, ...args),
    info: (...args) => console.info(`[${prefix}]`, ...args),
    warn: (...args) => console.warn(`[${prefix}]`, ...args),
    error: (...args) => console.error(`[${prefix}]`, ...args),
  };
}

module.exports = createLogger();
