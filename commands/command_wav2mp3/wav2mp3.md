Wav to Mp3 conversion wrapper for Sound eXchange command line utility (sox).
---

Config example:
````
"@voicenter/voicenter_pastash_command_wav2mp3": {
    "pluginFieldName": "Wav2mp3",
    "inputFileField": "convertFilePath",
    "outputFileField": "convertedFilePath",
    "inputNameField": "convertFileName",
    "outputNameField": "convertedFileName"
}
````

Example of JSON payload for such configuration in case of 'field' parameter of Pastash configuration value is 'Command' :
````
{
  "@timestamp": "4200000000",
  "Command": {
    "Wav2mp3": {
      "convertFilePath": "/file/path",
      "convertedFilePath": "/file/path",
      "convertFileName": "fileName.wav",
      "convertedFileName": "fileName.mp3"
    }
  }
}
````

Commands list:
````
wav2mp3Convert();
````