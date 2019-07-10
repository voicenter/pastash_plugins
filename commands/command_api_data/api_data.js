/*
 * API data layer for PaStash Commands
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');
const pmx = require('pmx');
const jwt = require('jsonwebtoken');

let conf;
const defaultConf = {
  pluginFieldName: 'APIData'
};

module.exports = function plugin(userConf) {
  conf = { ...defaultConf, ...userConf };

  let probe = pmx.probe();
  let f_counter = probe.counter({
    name: 'API Data connector'
  });

  this.main.getParameter = function getParameter(next) {
    const data = this.data[conf.pluginFieldName];
    f_counter.inc();
    let apiData = '';

    let token = jwt.sign({
      account: data[conf.extraParam1Field],
      from: conf.from
    }, conf.jwtSecret);

    let apiUrl = new URL(data[conf.apiUrlField]);
    let headers = {
      "Authorization": "Bearer " + token
    };

    let connection = (apiUrl.protocol === 'https:') ? https : http;

    connection.get(apiUrl.href, { headers: headers }, (res) => {
      res.on('data', (chunk) => {
        apiData += chunk;
      });

      res.on('end', () => {
        let apiDataValue = JSON.parse(apiData);
        this.data[data[conf.forPluginNameField]][data[conf.forPluginDataNameField]] = data[conf.extraParam2Field] + apiDataValue[data[conf.apiValueField]];
        this.data.Result.push({
          plugin: conf.pluginFieldName,
          response: 200
        });
        f_counter.dec();
        next();
      });
    }).on("error", (err) => {
      console.log("Error: " + err.message);
      delete(this.data._operationId);
      this.data.Result.push({
        plugin: conf.pluginFieldName,
        response: 500
      });
      f_counter.dec();
      next();
    });
  };
  // Some future features
  // this.main.sendParameter = function sendParameter(next) {
  //
  // };
};
