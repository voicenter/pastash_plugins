/*
 * Upload and check file for PaStash Commands
 * (C) 2019 QXIP BV
 */

const basicFtp = require("basic-ftp");
const fs = require('fs');
const logger = require('log4node');
const pmx = require('pmx');

let conf;
const defaultConf = {
  pluginFieldName: 'FileTransferDown',
  port: 21,
  username: 'anonymous',
  secure: false
};

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name: 'Downloading files by ftp'
  });

  this.main.downloadFile = function downloadFile(next) {
    const data = this.data[conf.pluginFieldName];

    if (data.hasOwnProperty(conf.inputFileField) && data.hasOwnProperty(conf.outputFileField)) {
      let source = data[conf.inputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField];
      let destination = data[conf.outputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField];

      const ftp = new basicFtp.Client();
      ftp.access({
        host: data[conf.ftpServer] || conf.host,
        port: conf.port,
        user: conf.username,
        password: conf.password,
        secure: conf.secure,
        secureOptions: {
          host: data[conf.ftpServer] || conf.host
        }
      })
        .then(() => {
          f_counter.inc();
          return ftp.download(
            fs.createWriteStream(destination),
            source
          );
        })
        .then(() => {
          return Promise.all([
            fs.promises.stat(destination), // local info
            ftp.size(source) // remote files
          ]);
        })
        .then((filesInfo) => {
          if (parseInt(filesInfo[1]) !== parseInt(filesInfo[0].size)) {
            throw new Error('Downloading by ftp: File size does not match original.');
          }
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 200
          });
          logger.info('Downloaded a file.', conf.pluginFieldName);
        })
        .catch((err) => {
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 500
          });
          delete(this.data._operationId);
          logger.error('Downloading by ftp: Failed on file download.');
        })
        .finally(() => {
          f_counter.dec();
          ftp.close();
          next();
        });
    } else {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: 400
      });
      throw new Error('Downloading by ftp: No data to process.');
    }
  };
};
