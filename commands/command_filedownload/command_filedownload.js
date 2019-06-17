/*
 * Upload and check file for PaStash Commands
 * (C) 2019 QXIP BV
 */

const PromiseFtp = require("promise-ftp");
const fs = require('fs');

let conf;
const defaultConf = {
  pluginFieldName: 'FileTransferDown',
  port: 21,
  username: 'anonymous',
  secure: false
};

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  this.main.downloadFile = function downloadFile(next) {
    const data = this.data[conf.pluginFieldName];
    if (data.hasOwnProperty(conf.downloadInputFileField)) {
      const ftp = new PromiseFtp();
      ftp.connect({
        host: conf.host,
        port: conf.port,
        user: conf.username,
        password: conf.password,
        secure: conf.secure
      })
        .then(() => {
          return ftp.get(data[conf.downloadInputFileField] + data[conf.nameField]);
        })
        .then((stream) => {
          return new Promise(function (resolve, reject) {
            stream.once('close', resolve);
            stream.once('error', reject);
            stream.pipe(fs.createWriteStream(data[conf.downloadOutputFileField] + data[conf.nameField]));
          });
        })
        .then(() => {
          return new Promise(function (resolve) {
            fs.stat(data[conf.downloadOutputFileField] + data[conf.nameField], (err, stats) => {
              if (err) {
                throw err;
              }
              resolve(stats);
            });
          });
        })
        .then((stats) => {
          if (parseInt(stats.size) !== parseInt(data[conf.sizeField])) {
            console.log('File size does not match on download');
          }
        })
        .catch((err) => {
          console.log('Failed on file download');
          console.log(err);
        })
        .finally(() => {
          ftp.end();
          next();
        });
    } else {
      next();
    }
  };
};
