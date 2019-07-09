/*
 * S3 Functions for PaStash Commands
 * (C) 2019 QXIP BV
 */
const AWS = require('aws-sdk');
const BluebirdPromise = require('bluebird');
const fs = require("fs");
const crypto = require("crypto");

let conf;
const defaultConf = {
  pluginFieldName: 'FileFetch',
  bucketName: 'fetchBucket'
};

function checksum(str, algorithm, encoding) {
  return crypto
    .createHash(algorithm || 'md5')
    .update(str, 'utf8')
    .digest(encoding || 'hex')
}

function saveObjectToFile(bucket, key, path) {
  return new BluebirdPromise(function (resolve, reject) {
    let s3 = new AWS.S3();
    let params = { Bucket: bucket, Key: key };
    let writeStream = fs.createWriteStream(path);
    let res = {
      etag: null,
      length: null
    };

    s3.getObject(params).on('httpHeaders', function (statusCode, headers) {
      if (headers.etag) {
        res.etag = headers.etag;
      }
      if (headers['content-length']) {
        res.length = headers['content-length'];
      }
    }).createReadStream().pipe(writeStream);

    writeStream.on('finish', function () {
      resolve(res);
    })
      .on('error', function (err) {
        reject('Writestream to ' + path + ' did not finish successfully: ' + err);
      });
  });
}

function deleteObject(bucket, key) {
  return new BluebirdPromise(function (resolve, reject) {
    let s3 = new AWS.S3();
    let params = { Bucket: bucket, Key: key };

    s3.deleteObject(params, function (error, data) {
      if (error) {
        reject(error);
      }
      else {
        resolve(data);
      }
    });
  });
}

module.exports = function plugin(userConf) {
  conf = { ...defaultConf, ...userConf };

  this.main.s3Fetch = function s3Fetch(next) {
    const data = this.data[conf.pluginFieldName];

    AWS.config.update({
      accessKeyId: conf['buckets'][data[conf.bucketField]].accessKeyId,
      secretAccessKey: conf['buckets'][data[conf.bucketField]].secretAccessKey
    });

    saveObjectToFile(data[conf.bucketField], data[conf.nameField], data[conf.outputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField]).then((res) => {
      const remoteMd5 = res.etag.replace(/"/g, '');

      fs.readFile(data[conf.outputFileField].replace(/\/$/ig, '') + '/' + data[conf.nameField], function (err, resFile) {

        if (err) {
          throw err;
        }

        if (!remoteMd5) {
          throw 'cannot get remote md5';
        }

        if (remoteMd5 !== checksum(resFile)) {
          throw 'files checksum not match';
        }

        next();
      })
    }).catch((err) => {
      console.log(err, 'file fetch error');
    });
  };

  this.main.s3Delete = function s3Fetch(next) {
    const data = this.data[conf.pluginFieldName];

    AWS.config.update({
      accessKeyId: conf['buckets'][data[conf.bucketField]].accessKeyId,
      secretAccessKey: conf['buckets'][data[conf.bucketField]].secretAccessKey
    });

    deleteObject(data[conf.bucketField], data[conf.nameField]).then((res) => {
      next();
    }).catch((err) => {
      console.log(err, 'error deleting file');
    });
  }

};
