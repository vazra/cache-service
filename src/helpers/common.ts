/**
 * Set default value
 */
export const defaults = (
  conf: { [key: string]: any },
  defaultConf: { [key: string]: any }
) => {
  for (let i in defaultConf) {
    if (defaultConf.hasOwnProperty(i))
      if (!conf.hasOwnProperty(i)) {
        conf[i] = defaultConf[i];
      } else {
        if (typeof conf[i] === 'object' && conf[i] !== null) {
          defaults(conf[i], defaultConf[i]);
        }
      }
  }
  return conf;
};

/**
 * Adds milliseconds to current date
 */
export const addMSToNow = (ms: number) => {
  let now = new Date();
  return new Date(now.setMilliseconds(now.getMilliseconds() + ms));
};
