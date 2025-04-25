const fs = require('fs');
const path = require('path');

function appender(config) {
  return (loggingEvent) => {
    const dateNow = new Date();
    const dirName = `${dateNow.getFullYear()}-${dateNow.getMonth() + 1}-${dateNow.getDate()}`;
    const baseDir = path.join(config.baseDir, dirName); 
    // const categoryDir = path.join(baseDir, loggingEvent.categoryName);
    const filename = path.join( baseDir+`/${loggingEvent.categoryName}.${dateNow.getDate()}-${dateNow.getMonth() + 1}-${dateNow.getFullYear()}.log`);
 
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true }); 
    }

    const fileStream = fs.createWriteStream(filename, { flags: 'a' });
    fileStream.on('error', (err) => {
      console.error('Error writing to log file', err);
    }); 
    fileStream.write(loggingEvent.data.join(' ') + '\n');
    fileStream.end();
  };
}

function configure(config) {
  config.baseDir = config.baseDir || 'logs'; 
  return appender(config);
}

module.exports = {
  configure: configure
};
