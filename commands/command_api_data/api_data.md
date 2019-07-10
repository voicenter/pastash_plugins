API Connector command plugin
---
API Connector can add or replace input parameter of following command with a value retrieved via web api.


Config example:
````
"@voicenter/voicenter_pastash_command_cryptofile": {
    "pluginFieldName": "APIData",
    "apiUrlField": "apiUrl",
    "apiValueField": "apiValueKey",
    "forPluginNameField": "pluginName",
    "forPluginDataNameField": "pluginData",
    "extraParam1Field": "accountId",
    "extraParam2Field": "uniqueIvr",
    "jwtSecret": "shhhhh"
}
````

Commands list:
````
getParameter();
sendParameter(); Not Implemented
````