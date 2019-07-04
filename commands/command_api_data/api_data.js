/*
 * API data layer for PaStash Commands
 */

const https = require('http');
const pmx = require('pmx');
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
  const options = {};

  this.main.getParameter = function getParameter(next) {
    const data = this.data[conf.pluginFieldName];
    f_counter.inc();
    let apiData = '';
    // ToDo: Implement different auth methods (sid, jwt...)
    https.get(data[conf.apiUrlField]+'?api-key='+data[conf.apiKeyField], (res) => {
      res.on('data', (chunk) => {
        apiData += chunk;
      });

      res.on('end', () => {
        let apiDataValue = JSON.parse(apiData);
        this.data[data[conf.forPluginNameField]][data[conf.forPluginDataNameField]] = apiDataValue;
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
