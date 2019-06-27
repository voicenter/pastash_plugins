/*
 * aes256 File Encryption for PaStash Commands
 * (C) 2019 QXIP BV
 */

const encryptor = require('file-encryptor');
const pmx = require('pmx');
let conf;
const defaultConf = {
  algorithm: 'aes256',
  pluginFieldName: 'FileEcryptor'
};

module.exports = function plugin(userConf) {
  conf = { ...defaultConf, ...userConf };

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name: 'Encrypting/Decrypting files'
  });

  const options = {
    algorithm: conf.algorithm,
  };

  this.main.encryptFile = function encryptFile(next) {
    const data = this.data[conf.pluginFieldName];
    f_counter.inc();
    encryptor.encryptFile(data[conf.inputFileField], data[conf.outputFileField], data[conf.keyField], options, (err) => {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: err ? 500 : 200
      });
      f_counter.dec();
      next();
    });
  };

  this.main.decryptFile = function decryptFile(next) {
    const data = this.data[conf.pluginFieldName];
      f_counter.inc();
    encryptor.decryptFile(data[conf.inputFileField], data[conf.outputFileField], data[conf.keyField], options, (err) => {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: err ? 500 : 200
      });
      f_counter.dec();
      next();
    });
  };
};
