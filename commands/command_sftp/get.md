Upload and check file command plugin
---

Config example:
````
"@voicenter/voicenter_pastash_command_sftp": {
    "pluginFieldName": "SFTPGet",  // Host parameter name for particular plugin
    "inputFileField": "uploadSourceFilePath", // Input file path for upload. 
    "outputFileField": "uploadDestFilePath",  // Output file path for upload.
    "defaultDestFilePath": "/path/to/file", // Default output file path
    "nameField": "fileName", // File name
    
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
     "SFTPGet": {
         "downloadSourceFilePath": "/path/to/remote/file",
         "downloadDestFilePath": "/path/to/local/file",
         "fileName": "file_name.wav"
     }
  }
}
````

Commands list:
````
SFTPGet();
````