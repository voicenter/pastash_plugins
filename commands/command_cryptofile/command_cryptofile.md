Crypto File command plugin
---

Config example:
````
"@voicenter/voicenter_pastash_command_cryptofile": {
    "pluginFieldName": "FileEcryptor",
    "inputFileField": "sourceFilePath",
    "outputFileField": "destFilePath",
    "keyField": "key",
    "ivField": "iv",
    "algorithm": "aes256"
}
````

Commands list:
````
encryptFile();
decryptFile();
````