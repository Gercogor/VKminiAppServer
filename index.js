const express = require('express');
const app = express();
const http = require('http');
// const fs = require( 'fs' );
// let options = {
//     key: fs.readFileSync('./test_key.key'),
//     cert: fs.readFileSync('./test_cert.crt'),
//     ca: fs.readFileSync('./test_ca.crt'),
//
//     requestCert: false,
//     rejectUnauthorized: false
// }
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require('cors')

app.use(cors())

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:10888"],
        credentials: true,
        allowedHeaders: ["my-custom-header"],
        methods:  ['GET','POST'],
        handlePreflightRequest: (req, res) =>{
            res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "my-custom-header",
                "Access-Control-Allow-Credentials": true,
                "Content-Security-Policy": "upgrade-insecure-requests",
            });
            res.end();
        }
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let users = [];
let messenger = [];

io.on('connection', (socket) => {
    // console.log(`a user connected ${socket.id}`);
    users.push(socket.id);
    socket.on('disconnect', () => {
        users = users.filter(u=>u!==socket.id)
        messenger = messenger.filter(msg=>msg.id!==socket.id)
    });

    socket.on('send-message',(id, message)=>{
        messenger.push({id, message})
        io.emit('receive-messenger', messenger)
    })

    setInterval(function() {
        io.emit('online', users.length);
    }, 500);

});



server.listen(3000, () => {
    console.log('listening on *:3000');
});