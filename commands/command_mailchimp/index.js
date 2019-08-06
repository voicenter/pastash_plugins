/*
 * MailChimp Functions for PaStash Commands
 * (C) 2019 QXIP BV
 */
const Mailchimp = require('mailchimp-api-v3');

let conf;
const defaultConf = {
  pluginFieldName: 'MailChimp'
};

module.exports = function plugin(userConf) {
  conf = {
    ...defaultConf,
    ...userConf
  };

  this.main.mcSubscribe = function mcSubscribe(next) {
    const data = this.data[conf.pluginFieldName];
    let mailchimp;

    if (!data[conf.subscribeData.contactData].email_address || !data[conf.subscribeData.contactData].status) {
      this.data.error = conf.pluginFieldName + ' plugin error wrong contact email or status';
      self.emit('output', this.data);
      return;
    }

    try {
      mailchimp = new Mailchimp(data[conf.keyField]);
    } catch (error) {
      this.data.error = conf.pluginFieldName + ' plugin error wrong apiKey';
      self.emit('output', this.data);
      return;
    }

    mailchimp.get({
      path: '/search-members',
      query: {
        list_id: data[conf.subscribeData.listField],
        query: data[conf.subscribeData.contactData].email_address
      }
    }).then(result => {
      let memberId = '';

      if (result.exact_matches.total_items) {
        memberId = '/' + result.exact_matches.members[0].id;
      }

      mailchimp.request({
        method: result.exact_matches.total_items ? 'patch' : 'post',
        path: `/lists/${data[conf.subscribeData.listField]}/members${memberId}`,
        body: data[conf.subscribeData.contactData]
      }, (res) => {
        next();
      })
    }).catch(err => {
      this.data.error = conf.pluginFieldName + ' plugin error ' + err.detail;
      self.emit('output', this.data);
      return;
    })
  }

  this.main.mcSendMail = function mcSendMail(next) {
    const data = this.data[conf.pluginFieldName];
    let mailchimp;

    const action = data[conf.emailData.actionField] || 'send';

    try {
      mailchimp = new Mailchimp(data[conf.keyField]);
    } catch (error) {
      this.data.error = conf.pluginFieldName + ' plugin error wrong apiKey';
      self.emit('output', this.data);
      return;
    }

    if (data[conf.emailData.campingField] && action) {

      mailchimp.post({
        path: `/campaigns/${data[conf.emailData.campingField]}/actions/${action}`,
      }).then(result => {
        next();
      }).catch(err => {
        this.data.error = conf.pluginFieldName + ' plugin error ' + err.detail;
        self.emit('output', this.data);
        return;
      })
    } else {

      if (!data[conf.emailData.typeField] && data[conf.emailData.typeField] != ("regular" || "plaintext" || "absplit" || "rss" || "variate")) {
        this.data.error = conf.pluginFieldName + ' email type is important types: "regular, plaintext, absplit, rss, variate"';
        self.emit('output', this.data);
        return;
      }

      if (!data[conf.emailData.listData].list_id) {
        this.data.error = conf.pluginFieldName + ' recipient list id is important';
        self.emit('output', this.data);
        return;
      }

      mailchimp.post({
        path: '/campaigns',
        body: {
          type: data[conf.emailData.typeField],
          recipients: data[conf.emailData.listData],
          settings: data[conf.emailData.settingsData],
          variate_settings: data[conf.emailData.variateSettingsData],
          tracking: data[conf.emailData.trackingData],
          rss_opts: data[conf.emailData.rssOptsData],
          social_card: data[conf.emailData.socialCardData]
        }
      }).then(result => {
        const campaignId = result.id;

        if (!campaignId) {
          this.data.error = conf.pluginFieldName + ' error creating camping';
          self.emit('output', this.data);
          return;
        }

        mailchimp.post({
          path: `/campaigns/${campaignId}/actions/${action}`,
        }).then(result => {
          next();
        }).catch(err => {
          this.data.error = conf.pluginFieldName + ' plugin error ' + err.detail;
          self.emit('output', this.data);
          return;
        })
      }).catch(err => {
        this.data.error = conf.pluginFieldName + ' plugin error ' + err.detail;
        self.emit('output', this.data);
        return;
      })
    }
  }
}