function normalizeHost(host) {
  return (host === '0.0.0.0' ? 'localhost' : host) || 'localhost';
}

module.exports = {
  normalizeHost,
};