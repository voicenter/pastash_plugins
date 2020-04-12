
//{"address":"6.6.6.6","list":"xxxxx"}
const RosApi = require('node-routeros').RouterOSAPI;
var CircularJSON = require('circular-json');
var conf,
    defaultConf = {
        debug:false,
        "hostField": "host",
        "portField": "port",
        "userField": "user",
        "addressField": "address",
        "listField": "list",
        "commentField": "comment",
        "timeoutField": "timeout",
        "disabledField": "disabled"
    };

function getPluginFields(data,conf,fieldName) {
    if(data.message&&data.message.constructor.name==="Object")data=data.message;
    if(conf[fieldName+"Field"]&&  data[conf[fieldName+"Field"]]){
        return data[conf[fieldName+"Field"]]
    }else if(conf[fieldName]){
        return  conf[fieldName]
    }else {
        switch (fieldName) {
            case "comment":
                return "Pastash firewall address-list";
            case "timeout":
                return false;
            case "disabled":
                return "no";
            default:
                let confFieldName=fieldName;
                if(conf[fieldName])confFieldName=conf[fieldName];
                throw new Error("No "+fieldName+" parameter was found:"+confFieldName)
        }
    }
}

module.exports = function plugin(userConf) {
    conf = { ...defaultConf, ...userConf };
    // decorate class prototype
    this.main.chain = function (next) {
        // calling next  this to allow chaining on this function
        next();
    };
    //Some demo staff nedd to clean there for async test concept 
    this.main.AddToAddressList = AddToAddressList;

};
//Some demo staff nedd to clean there for async test concept 
var AddToAddressList = function (next) {
    let that  = this;
    console.log(CircularJSON.stringify(this.data));
  let conInfo =   {
        host: '192.168.88.1',
            user: 'admin',
        password: ''
    };
    conInfo.host =getPluginFields(this.data,conf,"host");
    conInfo.user =getPluginFields(this.data,conf,"user");
    conInfo.password =getPluginFields(this.data,conf,"password");
    //Validate address exist
    let address ="";
    try{
        address = getPluginFields(this.data,conf,"address");
    }catch (e) {
        console.error(e.message,e);
        if(conf.debug){this.data.Error=e}else{this.data.Error=e.message}

        next();
        return;
    }
    let list ="";
    try{
        list = getPluginFields(this.data,conf,"list");
    }catch (e) {
        next(null,{"Msg":"No list Name exist","Error":e});
        return;
    }
    let comment = getPluginFields(this.data,conf,"comment");
    let timeout = getPluginFields(this.data,conf,"timeout");
    let disabled = getPluginFields(this.data,conf,"disabled");


    const conn = new RosApi(conInfo);

    conn.connect()
        .then(() => {
            // Connection successful
            let ipListAddParameterList =[
                "=list="+list,
                "=address="+address ,
                "=disabled="+disabled
            ];
            if(timeout)ipListAddParameterList.push("=timeout="+timeout);
            if(comment)ipListAddParameterList.push("=comment="+comment);
            conn.write('/ip/firewall/address-list/add',ipListAddParameterList )
                .then(mikrotikResponse => {
                    console.log('Printing address info: ', mikrotikResponse);
                    that.data.MikrotikResponse=mikrotikResponse;
                    next(null);
                    conn.close();
                    // We got the address added, let's clean it up
                }).catch(err => {
                // Got an error while trying to connect
                conn.close();
                that.data.MikrotikResponse=err.message;
                if(conf.debug)that.data.MikrotikResponse=err;
                next(null,{Error:err});
                console.log(err);
                throw new Error("Router error on /ip/firewall/address-list/add ",err)
            });
        })
        .catch(err => {
            // Got an error while trying to connect
            console.log(err);
            throw new Error("Router connect error",err)
        });

};
