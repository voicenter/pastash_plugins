Download and check file command plugin
---

Config example:
````
"@voicenter/voicenter_pastash_command_fileupload": {
    "pluginFieldName": "FileTransferDown",  // Host parameter name for particular plugin
    "inputFileField": "downloadSourceFilePath", // Input file path for download. 
    "inputMvFileField": "moveToSourceFilePath", // Move remote file to. 
    "outputFileField": "downloadDestFilePath",  // Output file path for download.
    "nameField": "fileName", // File name input field name
    "defaultDestFilePath": "/Users/maksim/proj/voicestash", // Default download path
    
    // FTP params
    "host": "host",
    "usarname": "usarname",
    "password": "password",
    "port": "port",
    "secure": true
        
    // SFTP params
    "host": "host",
    "usarname": "usarname",
    "password": "password"
}
````

Example of JSON payload for such configuration in case of 'field' parameter of Pastash configuration value is 'Command' :
````
{
  "@timestamp": "4200000000",
  "Command": {
    "FileTransferDown": {
      "downloadSourceFilePath": "/remote/path",
      "moveToSourceFilePath": "/remote/another/path",
      "downloadDestFilePath": "/local/path",
      "fileName": "file.name"
    }
  }
}
````

Commands list:
````
downloadFile();
````