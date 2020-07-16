'use strict'
const EventEmmiter      = require('events');
//const Buffer            = require('buffer')
const net = require('net');

class jsSessionClient extends EventEmmiter
{
    constructor(app)
    {
        super();
        this._socket = null;
        this._app = app;
        this._buff = null;
    }
}

jsSessionClient.prototype.connectTo = function(host, port){
    if (this._socket)
        return;

    this._socket = net.connect(port, host, () => {
        console.log("[client]connected to  " + host+":" + port )
    });

    this._socket.on('data', (data) => {
        console.log('[client]data:')
    })

    this._socket.on('close', (err) => {
        console.log('[client]close:')
        this._socket = null;        
    })

    this._socket.on('end', (err) => {
        console.log('[client]end:')
    })      
}

jsSessionClient.prototype.on_message = function (id, msg){
    this._app.on_message(id, msg);
}

jsSessionClient.prototype.on_data = function(data){
    let buff = Buffer.from(data)
    if (this._buff) {
        buff = Buffer.concat([this._buff, buff]);
        this._buff = null;
    }

    const msg_t = this._app.decode_raw_msg(buff);
    if (msg_t.data) {
        this._buff = Buffer.from(msg_t.data);
    }

    for (var i in msg_t.msgArray) {
        // protobuf decode 
    }
}

module.exports = jsSessionClient;


