var osc = require('node-osc');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
const io = require('socket.io')(server, {
	cors: {
		origin: '*',
	}
});

server.listen(8081);
var oscServer, oscClient;

var isConnected = false;

io.sockets.on('connection', function (socket) {
	console.log('connection');
	socket.on("config", function (obj) {
		isConnected = true;
		oscServer = new osc.Server(obj.server.port, obj.server.host);
		oscClient = new osc.Client(obj.client.host, obj.client.port);
		oscClient.send('/status', socket.sessionId + ' connected');
		oscServer.on('message', function (msg, rinfo) {
			socket.emit("message", msg);
		});
		socket.emit("connected", 1);
	});
	socket.on("message", function (obj) {
		console.log(obj)
		oscClient.send.apply(oscClient, obj);
	});
	socket.on('disconnect', function () {
		if (isConnected) {
			oscServer.kill();
			oscClient.kill();
		}
	});
});