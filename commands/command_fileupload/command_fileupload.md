Upload/Download and check file command plugin
---

Config example:
````
"@voicenter/voicenter_pastash_command_fileupload": {
    "pluginFieldName": "FileTransfer",  // Host parameter name for particular plugin
    "uploadInputFileField": "uploadSourceFilePath", // Input file path for upload. 
    "uploadOutputFileField": "uploadDestFilePath",  // Output file path for upload.
    "downloadInputFileField": "downloadSourceFilePath", // Input file path for download. 
    "downloadOutputFileField": "downloadDestFilePath",  // Output file path for download.
    "nameField": "fileName", // File name
    "sizeField": "fileSize", // File size for checking
    
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
    "FileTransfer": {
      "uploadSourceFilePath": "/local/path",
      "uploadDestFilePath": "/remote/path",
      "downloadSourceFilePath": "/remote/path",
      "downloadDestFilePath": "/local/path",

      "fileName": "file.name",
      "fileSize": "42"
    }
  }
}
````

Commands list:
````
uploadFile();
downloadFile();
````