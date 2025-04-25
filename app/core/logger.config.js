const log4js = require("log4js");
const path = require("path");

const getFormattedDateTime = () => {
  const date = new Date(); 
  const year = date.getFullYear(); 
  const month = ('0' + (date.getMonth() + 1)).slice(-2); 
  const day = ('0' + date.getDate()).slice(-2); 
  const hours = ('0' + date.getHours()).slice(-2);  
  const minutes = ('0' + date.getMinutes()).slice(-2); 

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

log4js.configure({
  appenders: {
    custom: {
      type: path.join(__dirname, "myDateFileAppender"),  
    },
  },
  categories: {
    default: { appenders: ["custom"], level: "info" },
    error: { appenders: ["custom"], level: "error" },
    fatal: { appenders: ["custom"], level: "fatal" },
  },
});

exports.log = {
  info: (...log) => { 
    log4js.getLogger("info").info(`[${getFormattedDateTime()}] - ${log}`);
  },
  error: (...log) => {
    log4js.getLogger("error").error(`[${getFormattedDateTime()}] - ${log}`);
  },
  fatal: (...log) => {
    log4js.getLogger("fatal").fatal(`[${getFormattedDateTime()}] - ${log}`);
  },
};
