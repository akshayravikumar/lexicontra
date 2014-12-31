//var app = require('express')();
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');

server.listen(3000);
var ang = require('./anagrams');
//app.get('/', function (req, res) {
 // res.sendfile(__dirname + '/public/index.html');
//});

app.use(express.static(path.join(__dirname,'public')));

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
	io.emit('this', { will: 'be received by everyone'});
	console.log(socket.id);
    console.log('client connected');
    ang.initGame(io, socket);
});


