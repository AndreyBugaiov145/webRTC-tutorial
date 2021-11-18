
/*
const WebSocket = require('ws')
console.log(WebSocket);

const wss = new WebSocket.Server({ port: 8080 })
wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message => ${message}`)
    })
    ws.send('ho!')
})


*/








/*
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
        // Make sure we only accept requests from an allowed origin
        request.reject();
        console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
        return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});


*/







    var http = require('http');
    var static = require('node-static');


    const fs = require('fs');
    var file = new static.Server('.');
    const WebSocket = require('ws');

const server = http.createServer(function(req, res) {
        file.serve(req, res);
    }).listen(8080);

    console.log('Server running on port 9090');

let connections =new Set();


const ws = new WebSocket.Server({server});

ws.on('connection', (connection, req) => {
    connections.add(connection);
    const ip = req.socket.remoteAddress;
    console.log(`Connected ${ip}`);
   // console.log('Connected',  connection);
    let i = 0;
    for (const client of ws.clients) {

        i++;
        console.log(i)
    }

    connection.on('message', message => {
        console.log(connection);
        console.log('Received: ' + message);
        var data = JSON.parse(message);
        switch(data.type) {
            case "login":
                connection.send(JSON.stringify({
                    type: "login",
                    success: true
                }));
                break;
            case "offer":
                for (const client of ws.clients) {
                    console.log('client offer');
                    if (client.readyState !== WebSocket.OPEN) continue;
                    if (client === connection) continue;
                    client.send(JSON.stringify({
                        type: "offer",
                        name:data.name,
                        offer: data.offer
                    }));
                }

                break;
            case "answer":
                for (const client of ws.clients) {
                    console.log('client offer');
                    if (client.readyState !== WebSocket.OPEN) continue;
                    if (client === connection) continue;
                    console.log('ANSEWR')
                    client.send(JSON.stringify({
                        type: "answer",
                        answer:data.answer
                    }));
                }
                break;
            case "candidate":
                onCandidate(data.candidate);
                break;
            default:
                break;
        }


        /*for (const client of ws.clients) {
            console.log('client');
            if (client.readyState !== WebSocket.OPEN) continue;
            if (client === connection) continue;
            console.log('clientSend');
            client.send(message);
        }*/
    });
    connection.on('close', () => {
        console.log(`Disconnected ${ip}`);
        connections.delete(ws);
    });

    connection.send(JSON.stringify({
        type: "test",
        name : 'test'
    }));
   // ws.send('something');
});




/*

var WebSocketServer = new require('ws');

// подключённые клиенты
var clients = {};

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({
    port: 8080
});
webSocketServer.on('connection', function(ws) {

    var id = Math.random();
    clients[id] = ws;
    console.log("новое соединение " + id);

    ws.on('message', function(message) {
        console.log('получено сообщение ' + message);

        for (var key in clients) {
            clients[key].send(message);
        }
    });

    ws.on('close', function() {
        console.log('соединение закрыто ' + id);
        delete clients[id];
    });

});
*/



/*
//require our websocket library
var WebSocketServer = require('ws').Server;

//creating a websocket server at port 9090
var wss = new WebSocketServer({port: 9090});

//when a user connects to our sever
wss.on('connection', function(connection) {
    console.log("user connected");

    //when server gets a message from a connected user
    connection.on('message', function(message){
        console.log("Got message from a user:", message);
    });

    connection.send("Hello from server");
});
*/