/*
 * Upload and check file for PaStash Commands
 * (C) 2019 QXIP BV
 */

const SFTPClient = require('sftp-promises');
const fs = require('fs');
const logger = require('log4node');
const pmx = require('pmx');

let conf;
const defaultConf = {
  // pluginFieldName: 'FileTransferDown',
  pluginFieldName: 'SFTPGet',
  port: 22,
  username: 'anonymous'
};

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name: 'Downloading files by sftp'
  });

  this.main.sftpGeFile = function sftpGeFile(next) {
    const data = this.data[conf.pluginFieldName];

    if (data.hasOwnProperty(conf.inputFileField)) {
      let source = data[conf.inputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField];
      let destination = (data[conf.outputFileField].replace(/\/$/ig, '') || conf.defaultDestFilePath) + '/' + data[conf.nameField];
      // ToDo: Private Key
      let sftp = new SFTPClient({
        host: data[conf.sftpServer] || conf.host,
        user: conf.username,
        password: conf.password,
      });

      sftp.ls(source)
        .then((list) => {
          if (list.hasOwnProperty('type') && list.type === 'file') {
            f_counter.inc();
            return Promise.all([sftp.get(source, destination), Promise.resolve(list.attrs.size)]);
          }
        })
        .then((result) => {
          return Promise.all([
            fs.promises.stat(destination), // local info
            result[1]
          ]);
        })
        .then((filesInfo) => {
          if (parseInt(filesInfo[1]) !== parseInt(filesInfo[0].size)) {
            throw new Error(
              'Downloading by sftp: File size does not match original. ' +
              parseInt(filesInfo[1]) + ' !== ' + parseInt(filesInfo[0].size)
            );
          }
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            downloadedFile: destination,
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
          logger.error('Downloading by sftp: Failed on file download.');
        })
        .finally(() => {
          f_counter.dec();
          next();
        });
    } else {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: 400
      });
      throw new Error('Downloading by sftp: No data to process.');
    }
  };
};
