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

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  this.main.uploadFile = function uploadFile(next) {
    const data = this.data[conf.pluginFieldName];
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
        return ftp.list(data[conf.uploadOutputFileField]).then((list) => {
          const size = list.find(it => it.name === data[conf.nameField]).size;
          if (parseInt(size) !== parseInt(data[conf.sizeField])) {
            console.log('File size does not match on upload');
          } else {
            ftp.end();
            return next();
          }
        })
      })
      .catch((err) => {
        console.log(err);
        ftp.end();
        return next();
      });
  };

  this.main.downloadFile = function downloadFile(next) {
    console.log(this.data);

    const data = this.data[conf.pluginFieldName];
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
        ftp.end();
        return next();
      })
      .catch((err) => {
        console.log(err);
        console.log('Failed on file download');
        ftp.end();
        return next();
      });
  };
};
