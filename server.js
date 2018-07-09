var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname +''));

http.listen(3000,'0.0.0.0', function(){
    console.log('listening on *:8080');
});

let history = [];
let lineColor;
io.on('connection', function (socket) {
    socket.on('drawLine', function (data){
        if (data!='start' && data){
            history.push(data)
            io.emit('drawLine', history);
        } else if (data=='start'){
            io.emit('drawLine', history);
        } else if (!data){
            history = [];
            io.emit('drawLine', '');
        }
    });
    socket.on('lineColor', function (data){
        lineColor = data;
        socket.emit('lineColor', lineColor)
    });
});