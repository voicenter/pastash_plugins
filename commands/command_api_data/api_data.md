API Connector command plugin
---
API Connector can add or replace input parameter of following command with a value retrieved via web api.


Config example:
````
"@voicenter/voicenter_pastash_command_cryptofile": {
    "pluginFieldName": "APIData",
    "apiKeyField": "apiKey",
    "apiUrlField": "apiUrl",
    "apiValueField": "apiValueKey",
    "forPluginNameField": "pluginName",
    "forPluginDataNameField": "pluginData"
}
````

Commands list:
````
getParameter();
sendParameter(); Not Implemented
````