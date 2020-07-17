//async = require("async");
const protobuf = require("protobufjs")
class Protocol
{
    constructor()
    {
        this._fullname           = new Map();    // packagename.MsgHello->protobuf.root
        this._packMap            = new Map();    // [ packgname1-> [msg1,msg2,msg3]; packagename2->[msg1,msg2,msg3] ]
    }

    printmap()
    {
        console.log("map:" + JSON.stringify(this._fullname))
    }

    init(protofiles)
    {
        for (let proto of protofiles) {
            this.init_file(proto)
        }
    }

    init_file(protofile)
    {
        protobuf.load(protofile, (err, root) => {
            console.log("loaded " + protofile)
            if (err)
                throw err;
            console.log("protofile = " + protofile)
            console.log(root)

            if (root._nestedArray) {
                for (let namespace of root._nestedArray) {
                    for (let msg of namespace._nestedArray) {
                        this._fullname.set(namespace + "." + msg.name, root);
                    }
                }
            }
            else if (root.nested) {

                for (let e in root.nested)
                {
                    console.log("package:" + e)
                    if (e._nestedArray) {
                        
                    } else {
                        for (let f in root.nested[e]) {
                            if (root.nested[e][f] instanceof protobuf.Type)
                            {
                                this._fullname.set(e+"."+root.nested[e][f].name, root)
                            }
                        }
                    }                        
                }
            }
        })
    }

    init_file_async(protofile)
    {
        return new Promise((resovle, rej) => {
            protobuf.load(protofile, (err, root) => {
                console.log("loaded " + protofile)
                if (err)
                    throw err;
                // console.log("protofile = " + protofile)
                // console.log(root)
    
                if (root._nestedArray) {
                    for (let namespace of root._nestedArray) {
                        for (let msg of namespace._nestedArray) {
                            this._fullname.set(namespace + "." + msg.name, root);
                        }
                    }
                }
                else if (root.nested) {
    
                    for (let e in root.nested)
                    {
                        console.log("package:" + e)
                        if (e._nestedArray) {
                            
                        } else {
                            for (let f in root.nested[e]) {
                                ///console.log(f)
                                //console.log(typeof (root.nested[e][f]))    
                                //console.log("==========================")
                                if (root.nested[e][f] instanceof protobuf.Type)
                                {
                                    //console.log(root.nested[e][f])
                                    this._fullname.set(e+"."+root.nested[e][f].name, root)
                                }
                            }
                        }                        
                    }
                }
                resovle();
            })
            
        })
    }

    verify(ProtoMsgName,msgObj)
    {
        const root = this._fullname.get(ProtoMsgName);
        if (root) {
            return root.lookupType(ProtoMsgName).verify(msgObj);
        } else {
            throw {"err":ProtoMsgName}
        }
    }

    encode(ProtoMsgName, msgObj)
    {
        const isHas = this._fullname.has(ProtoMsgName);
        if (isHas) {
            const msgType = this._fullname.get(ProtoMsgName).lookupType(ProtoMsgName);
            let msg = msgType.create(msgObj);
            let buffer = msgType.encode(msg).finish();
            return buffer;
        }
        return null;
    }

    decode(ProtoMsgName, buffer)
    {
        const isHas = this._fullname.has(ProtoMsgName);
        if (isHas) {
            const msgType = this._fullname.get(ProtoMsgName).lookupType(ProtoMsgName);
            let msgObj = msgType.decode(buffer)
            return msgObj;
        }
        return null;
    }

    getMsgType(ProtoMsgName)
    {
        const isHas = this._fullname.has(ProtoMsgName);
        if (isHas)
            return this._fullname.get(ProtoMsgName).lookupType(ProtoMsgName);
        else
            return null;
    }
}

module.exports = Protocol