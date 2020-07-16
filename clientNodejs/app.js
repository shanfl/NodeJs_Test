const Logger = require("./logger").DebugLog

const protobuf = require("protobufjs")

const Protocol = require('./protoHandler').protocol

const net = require('net');


/*
protobuf.load("./protos/Awsome.proto", (error, root) => {
    Logger.info("error : " + JSON.stringify(error) + ",root:" + JSON.stringify(root));
    console.log(root);

    for (let namespace of root._nestedArray)
    {
        console.log("namespace:" + namespace.name)
        for (let msg of namespace._nestedArray)
        {
            console.log("message:", msg.name)    
        }
    }
})
*/

const protocol = new Protocol();

async function init()
{
    await protocol.init_file_async("./protos/Awsome.proto")
    var err = protocol.verify("awesomepackage.AwesomeMessage", { awesomeField: "AwesomeString" })
    let bufferEncode  = protocol.encode("awesomepackage.AwesomeMessage", { awesomeField: "AwesomeString" });
    let objDecode = protocol.decode("awesomepackage.AwesomeMessage", bufferEncode);
    console.log(objDecode)
    console.log(bufferEncode)
}

function run()
{
    net.createConnection()
}

init();



