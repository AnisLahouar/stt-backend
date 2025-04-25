const os = require("os");

exports.getLocalIP =  () => {
  const interfaces =  os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];

    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family == "IPv4" &&
        alias.netmask == '255.255.255.0' &&
        !alias.internal
      ) {
        return alias.address;
      }
    }
  }
  return "0.0.0.0";
};
