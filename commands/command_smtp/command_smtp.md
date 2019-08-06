## SMTP Functions

IMPORTANT:

```
For gmail you should change the "Access for less secure apps" to Enabled https://myaccount.google.com/lesssecureapps
```

Config example:

```
"@voicenter/voicenter_pastash_command_smtp": {
    "pluginFieldName": "SMTP",
    "portField": "port",
    "hostField": "host",
    "userField": "user",
    "passField": "pass",
    "fromField": "from",
    "toField": "to",
    "ccField": "cc",
    "bccField": "bcc",
    "subjectField": "subject",
    "textField": "text",
    "htmlField": "html",
    "attachmentsData": "attachments"
}
```

Request example:

text: 'For clients with plaintext support only',
html: 'For clients that do not support AMP4EMAIL or amp content is not valid'

```

"SMTP": {
    "port": 465,
    "host": "smtp.gmail.com",
    "user": "test@gmail.com",
    "pass": "password",
    "from": "Name <test@gmail.com>",
    "to": "recipient@gmail.com, recipient1@gmail.com",
    "cc": "recipient2@gmail.com, recipient3@gmail.com",
    "bcc": "recipient4@gmail.com, recipient5@gmail.com",
    "subject": "test mail",
    "text": "plain text",
    "html": "<b>Html body</b>",
    "attachments": [
        {
            "path": "/audio/track.mp3"
        },
        {
             "path": "/files/file.dat"
        }
    ]
}
```

Attachments example:

```
attachments: [
    {   // utf-8 string as an attachment
        filename: 'text1.txt',
        content: 'hello world!'
    },
    {   // binary buffer as an attachment
        filename: 'text2.txt',
        content: new Buffer('hello world!','utf-8')
    },
    {   // file on disk as an attachment
        filename: 'text3.txt',
        path: '/path/to/file.txt' // stream this file
    },
    {   // filename and content type is derived from path
        path: '/path/to/file.txt'
    },
    {   // stream as an attachment
        filename: 'text4.txt',
        content: fs.createReadStream('file.txt')
    },
    {   // define custom content type for the attachment
        filename: 'text.bin',
        content: 'hello world!',
        contentType: 'text/plain'
    },
    {   // use URL as an attachment
        filename: 'license.txt',
        path: 'https://raw.github.com/nodemailer/nodemailer/master/LICENSE'
    },
    {   // encoded string as an attachment
        filename: 'text1.txt',
        content: 'aGVsbG8gd29ybGQh',
        encoding: 'base64'
    },
    {   // data uri as an attachment
        path: 'data:text/plain;base64,aGVsbG8gd29ybGQ='
    }
]
```

Commands list:

```
sendMail();
```
