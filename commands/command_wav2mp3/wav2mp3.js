const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs  = require('fs');
const logger = require('log4node');
const pmx = require('pmx');

let conf;
const defaultConf = {
  pluginFieldName: 'Wav2mp3',
  sampleRate: '8000'
};

module.exports = function plugin(userConf) {
  conf = {...defaultConf, ...userConf};

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name : 'Wav 2 Mp3 conversions'
  });

  this.main.wav2mp3Convert = function wav2mp3Convert(next) {
    const data = this.data[conf.pluginFieldName];

    if ((data.hasOwnProperty(conf.inputFileField) || conf.defaultSourceFilePath) && (data.hasOwnProperty(conf.outputFileField) || conf.defaultDestFilePath)) {
      let source      = ((data.hasOwnProperty(conf.inputFileField)) ? data[conf.inputFileField].replace(/\/$/ig, '') : conf.defaultSourceFilePath) + "/" + data[conf.inputNameField];
      let destination = (data.hasOwnProperty(conf.outputFileField) ? data[conf.outputFileField].replace(/\/$/ig, '') : conf.defaultDestFilePath) + '/' + data[conf.outputNameField];

      new Promise((resolve, reject) => {
        fs.access(source, fs.constants.R_OK, (err) => {
          if (err) {
            reject(err);
          }
          resolve();
        })
      })
        .then(() => {
          f_counter.inc();
          return new Promise((resolve, reject) => {
            exec("sox -t wav -r " + conf.sampleRate + " -c 1 " + source + " -t mp3 " + destination, (err, stdr, stde) => {
              if (err) {
                reject(err);
              }
              this.data.Result.push({
                plugin: conf.pluginFieldName,
                convertedFile: destination,
                response: 200
              });
              resolve();
            })
          });
        })
        .catch((err) => {
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 500
          });
          delete(this.data._operationId);
          logger.error('Wav 2 Mp3 conversion: failed to convert file.');
        })
        .finally(() => {
          f_counter.dec();
          fs.unlink(source, function() {});
          logger.info('File converted.', conf.pluginFieldName);
          next();
        });
    } else {
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: 400
      });
      throw new Error('Wav 2 Mp3 converter: No data to process.');
    }
  };
};