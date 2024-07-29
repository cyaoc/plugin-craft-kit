function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;

  sources.forEach((source) => {
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!target[key]) target[key] = {};
          mergeDeep(target[key], source[key]);
        } else {
          if (
            target[key] !== undefined &&
            typeof target[key] !== typeof source[key]
          ) {
            console.warn(
              `Type mismatch for key "${key}": keeping default value.`,
            );
            return;
          }
          target[key] = source[key];
        }
      });
    }
  });
  return target;
}

module.exports = {
  mergeDeep,
};
