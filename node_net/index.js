const net = require("net");

const server = net.createServer((c)=>{
    console.log('==> client connected c.address = ',c.address(),',localaddress:' ,c.localAddress);
    
    c.on('end',()=>{
        console.log("=>client-end disconnect..")
    })

    c.on('error',(err)=>{
        console.log('=>client-error');

    })

    c.on('close',(hadError )=>{
        console.log('=>client-close hadError =' ,hadError);
    })

    c.on('data',(data)=>{
        console.log('=>client-data'," ,data=", data.toString())
    })

    c.on('connect',()=>{
        console.log('=>client-connect'," ,data=", data)
    })

    c.on('ready', ()=>{
        console.log('=>client-ready'," ,data=", data)
    })

    
    c.write("Hello world \r\n");
})

server.on('error',(err)=>{
    throw err;
})

server.on('close',()=>{
    console.log("server-close")
})

server.on("connect",()=>{
    console.log('server-connecct')
})

server.on('data',(data)=>{
    console.log('server-data:',data)
})

server.on('timeout',()=>{
    console.log('server-timeout');
})


server.on('ready',()=>{
    console.log('server-ready');
})

server.on('listening',()=>{
    console.log("server-listening ,address:",server.address(),",maxConnects:" , server.maxConnections)
})



server.listen(8081,()=>{
    console.log("server-listen on port: 8081")
})

