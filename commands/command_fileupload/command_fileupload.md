Upload and check file command plugin
---

Config example:
````
"@voicenter/voicenter_pastash_command_fileupload": {
    "pluginFieldName": "FileTransfer",  // Host parameter name for particular plugin
    "inputFileField": "uploadSourceFilePath", // Input file path for upload. 
    "outputFileField": "uploadDestFilePath",  // Output file path for upload.
    "nameField": "fileName", // File name
    
    // FTP params
    "host": "host",
    "usarname": "usarname",
    "password": "password",
    "port": "port",
    "secure": true
}
````

Example of JSON payload for such configuration in case of 'field' parameter of Pastash configuration value is 'Command' :
````
{
  "@timestamp": "4200000000",
  "Command": {
    "FileTransferUp": {
      "uploadSourceFilePath": "/local/path",
      "uploadDestFilePath": "/remote/path",
      "fileName": "file.name"
    }
  }
}
````

Commands list:
````
uploadFile();
````