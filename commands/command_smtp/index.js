/*
 * SMTP Functions for PaStash Commands
 * (C) 2019 QXIP BV
 */

const nodemailer = require('nodemailer');

let conf;
const defaultConf = {
  pluginFieldName: "SMTP"
};

module.exports = function plugin(userConf) {
  conf = {
    ...defaultConf,
    ...userConf
  };

  this.main.sendMail = function sendMail(next) {
    const data = this.data[conf.pluginFieldName];

    const transporter = nodemailer.createTransport({
      host: data[conf.hostField],
      port: data[conf.portField],
      secure: data[conf.portField] == 465 ? true : false,
      auth: {
        user: data[conf.userField],
        pass: data[conf.passField]
      }
    });

    transporter.sendMail({
      from: data[conf.fromField],
      to: data[conf.toField],
      cc: data[conf.ccField],
      bcc: data[conf.bccField],
      subject: data[conf.subjectField],
      text: data[conf.textField],
      html: data[conf.htmlField],
      attachments: data[conf.attachmentsData]
    }).then(res => {
      next();
    }).catch(err => {
      this.data.error = conf.pluginFieldName + ' plugin error ' + err;
      self.emit('output', this.data);
      return;
    });
  };
};