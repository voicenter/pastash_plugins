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
  pluginFieldName: 'FileTransferUp',
  port: 21,
  username: 'anonymous',
  secure: false
};

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name : 'Uploading files by ftp'
  });

  this.main.uploadFile = function uploadFile(next) {
    const data = this.data[conf.pluginFieldName];

    if (data.hasOwnProperty(conf.inputFileField) && data.hasOwnProperty(conf.outputFileField)) {
      let source      = data[conf.inputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField];
      let destination = data[conf.outputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField];

      const ftp = new basicFtp.Client();
      ftp.access({
        host: data[conf.ftpServer] || conf.host,
        port: conf.port,
        user: conf.username,
        password: conf.password,
        secure: conf.secure
      })
        .then(() => {
          f_counter.inc();
          return ftp.upload(
            fs.createReadStream(source),
            destination
          );
        })
        .then(() => {
          return Promise.all([
            fs.promises.stat(source), // local info
            ftp.size(destination) // remote files
          ]);
        })
        .then((filesInfo) => {
          if (parseInt(filesInfo[1]) !== parseInt(filesInfo[0].size)) {
            throw new Error('Uploading by ftp: File size does not match original.');
          }
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 200
          });
          fs.unlink(source, () => {});
        })
        .catch((err) => {
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 500
          });
          delete(this.data._operationId);
          logger.error('Uploading by ftp: Failed on file download.');
        })
        .finally(() => {
          f_counter.dec();
          ftp.close();
          logger.info('Uploaded file.', conf.pluginFieldName);
          next();
        });
    } else {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: 400
      });
      throw new Error('Uploading by ftp: No data to process.');
    }
  };
};
