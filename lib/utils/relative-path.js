const path = require('path');

module.exports = function (p) {
  return path.relative(process.cwd(), p);
};
