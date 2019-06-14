/*
 * Upload and check file for PaStash Commands
 * (C) 2019 QXIP BV
 */

const PromiseFtp = require("promise-ftp");
const fs = require('fs');

let conf;
const defaultConf = {
  pluginFieldName: 'FileTransfer',
  port: 21,
  username: 'anonymous',
  secure: false
};

// ToDo: break to separate modules

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  this.main.uploadFile = function uploadFile(next) {
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
          return ftp.put(
            data[conf.uploadInputFileField] + data[conf.nameField],
            data[conf.uploadOutputFileField] + data[conf.nameField]);
        })
        .then(() => {
          return ftp.list(data[conf.uploadOutputFileField]);
        })
        .then((list) => {
          const size = list.find(it => it.name === data[conf.nameField]).size;
          if (parseInt(size) !== parseInt(data[conf.sizeField])) {
            console.log('File size does not match on upload');
          }
        })
        .catch((err) => {
          console.log('Failed on file upload');
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
            stream.pipe(fs.createWriteStream(data[conf.downloadOutputFileField] + data[conf.nameField] + '.copy'));
          });
        })
        .then(() => {
          return new Promise(function (resolve) {
            fs.stat(data[conf.downloadOutputFileField] + data[conf.nameField] + '.copy', (err, stats) => {
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

  this.main.notifyComplete = function (next) {
    process.emit('USRSIGCONSUME', this.data._operationId);
    next();
  }
};
