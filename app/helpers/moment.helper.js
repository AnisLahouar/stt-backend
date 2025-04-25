const moment = require('moment');




exports.getNow = () => {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}
