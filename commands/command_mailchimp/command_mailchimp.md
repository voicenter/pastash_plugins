## MailChimp Functions

Config example:

```
"@voicenter/voicenter_pastash_command_mailchimp": {
    "pluginFieldName": "MailChimp",
    "keyField": "key",
    "subscribeData": {
        "listField": "list",
        "contactData": "contact"
    },
    "emailData": {
        "typeField": "type",
        "listData": "recipients",
        "settingsData": "settings",
        "variateSettingsData": "variate_settings",
        "trackingData": "tracking",
        "rssOptsData": "rss_opts",
        "socialCardData": "social_card",
        "campingField": "camping_id",
        "actionField": "action"
    }
}
```

Request example:

for subsribe/unsubsribe use only subscribeData
for create camping and send email use only emailData

send camping_id if you want use existing camping, otherwise new camping will be created automaticly.

if you use existing capming send only "camping_id" and "action"

defaulf action type is "send", you can use (cancel-send, create-resend, pause, replicate, resume, schedule, send, test, unschedule)

see all avilable data in mailChimp api documentation (https://developer.mailchimp.com/documentation/mailchimp/reference/campaigns/)

```
"MailChimp": {
    "key": "c24a805ef3445689575697d6c3a87520-us19",
    "list": "7968ca250c",
    "contact": {
        "email_address": "test@test.com",
        "status": "subscribe"
    },
    "type": "plaintext",
    "recipients": {
        "list_id": "5192ca250c"
    },
    "settings": {
        "subject_line": "test mail",
        "preview_text": "preview_text",
        "title": "new test mail",
        "from_name": "Customer Service",
        "template_id": 75001
    },
    "variate_settings": {},
    "tracking": {},
    "rss_opts": {},
    "social_card": {},
    "camping_id": "8938ca250c",
    "action": "test"
}
```

Commands list:

```
mcSubscribe();
mcSendMail();
```
