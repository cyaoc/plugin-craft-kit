const { name } = require('../../package.json');

const pkgName = name.split('/')[1] || name.split('/')[0];
const projectName = name;

module.exports = {
  projectName,
  pkgName,
};
