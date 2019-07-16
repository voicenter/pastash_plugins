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

    // Build JWT from config
    let jwtConfig = {};

    Object.entries(conf.jwtConfig).forEach(([type, value]) => {
      if (value.hasOwnProperty('variable')) {
        jwtConfig[type] = data[value.variable];
      }
      if (value.hasOwnProperty('value')) {
        jwtConfig[type] = value.value;
      }
    });

    jwtConfig.exp = Math.floor(Date.now() / 1000) + (60 * 10); // 10 min exp

    let token = jwt.sign(jwtConfig, conf.jwtSecret);

    // Set JWT header
    let apiUrl = new URL(data[conf.apiUrlField]);
    let headers = {
      "Authorization": "Bearer " + token
    };

    //Detect protocol
    let connection = (apiUrl.protocol === 'https:') ? https : http;

    //Send API request
    connection.get(apiUrl.href, { headers: headers }, (res) => {
      res.on('data', (chunk) => {
        apiData += chunk;
      });

      res.on('end', () => {
        let apiDataValue = JSON.parse(apiData);
        // ToDo: add some flexibility, get rid of hardcoded 'key'
        if (apiDataValue.hasOwnProperty('key')) {
          this.data[data[conf.forPluginNameField]][data[conf.forPluginDataNameField]] = data[conf.extraParamField] + apiDataValue.key;
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 200
          });
        } else {
          delete(this.data._operationId);
          this.data.Result.push({
            plugin: conf.pluginFieldName,
            response: 400
          });
        }
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
