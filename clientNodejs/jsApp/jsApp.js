'use strict'
const EventEmitter = require('events')
const jsSessionClient = require(jsSessionClient)
const zlib = require('zlib');
const Protocol = require("./protoHandler")

class jsApp extends EventEmitter
{
    constructor()
    {
        super();  
        this._protoHandler = null;
        this._session = null;
        this._idMsgMap = null;
        this.on('app_receive_msg', (id, msg) => {
            this.on_message(id, msg);
        })
    }
}

jsApp.prototype.init =  function ()
{
    // return new Promiss()
}

jsApp.prototype.connectTo = function(host,port){
    if (this._session == null) {
        this._session = new jsSessionClient(this)
    }

    this._session.connectTo(host,port)
}

jsApp.prototype.sendbuff = function (buff){

}

jsApp.prototype.sendmsg = function (id,msg){

}

jsApp.prototype.on_message = function(id, msg){
}

jsApp.prototype.decode_raw_msg = function (data) {

    const MSG_CALLBACK_COOKIE_FLAG_RESPONE  = 0x80000000;
    const MSG_ZIPPED_FLAG                   = 0x80000000;
    const MSG_TRANSFER_FLAG                 = 0x40000000;
    const MSG_HEADER_SIZE                   = 20
    const MSG_TRANSFER_SIZE                 = 20
    const _MESSAGE_TYPE_OFFSET_             = 10000;

    let retTable = {}
    retTable.msgArray = [];
    retTable.data = data;
    while (true) {
        if (!data || data.lenth < MSG_HEADER_SIZE){
            break;
        }        
        let msg = {
            type: data.readInt32LE(0),
            size: data.readInt32LE(4),
            time: data.readInt32LE(8),
            cookie: data.readInt32LE(12),
            serial: data.readUInt32LE(16),
        }
    
        //msg.packsize = MSG_HEADER_SIZE + msg.size
        //if (data.length < msg.packsize)
        //   return { left: data };
        
        let bodyOffset = MSG_HEADER_SIZE
        let isTranser = msg.type & MSG_TRANSFER_FLAG;
        let isZipped = msg.type & MSG_ZIPPED_FLAG
    
        if (isTranser)
            msg.packsize += 20;
        
        if (isZipped)
            msg.packsize += 4;
        
        if (data.length < msg.packsize)
            break;
    
        msg.type &= ~(MSG_ZIPPED_FLAG|MSG_TRANSFER_FLAG);
        
        // 检查是否返回的cookie
        if(msg.cookie&MSG_CALLBACK_COOKIE_FLAG_RESPONE)
            msg.response_cookie = msg.cookie^MSG_CALLBACK_COOKIE_FLAG_RESPONE;
        else
            msg.response_cookie = 0;    
        
        //// 如果是转发的消息 PROTOCOL_SECTION.protocol_transfer
        if (isTranser) {
            bodyOffset += MSG_TRANSFER_SIZE;
            msg.transfer = []
            let count = data.readInt32LE(MSG_HEADER_SIZE);
            for (let i = 0; i < count; i++)
                msg.transfer.push(data.readInt32LE(MSG_HEADER_SIZE + 4 + i * 4))
        }
    
        // 整个消息的完整包，包括header+body，wsproxy二进制转发的时候，需要用到!!!
        // msg.data = Buffer.from(data.slice(0, MSG_HEADER_SIZE + msg.size));
        // unziped the msg.raw data
        if (isZipped) {
            msg.unzipsize = data.readInt32LE(bodyOffset)
            let raw = Buffer.from(data.slice(bodyOffset + 4, MSG_HEADER_SIZE + msg.size))  // slice(start,end)
            let res = zlib.unzipSync(raw)
            msg.raw = res;
        } else {
            msg.raw = Buffer.from(data.slice(bodyOffset,MSG_HEADER_SIZE + msg.size))
        }

        retTable.msgArray.push(msg);
        data = data.slice(msg.packsize);
    }

    for (let index in retTable.msgArray) {
        let msg = retTable.msgArray[index]
        var msgId = msg.type;
        var packname = this._idMsgMap.get(msgId);
        if (packname) {
            msg.jsMsg = this._protoHandler.decode(packname,msg.raw)
        }
    }
    return retTable;
}

jsApp.prototype.register_id_msg_map = function(id, name){
    this._idMsgMap.set(id,name)
}
   



