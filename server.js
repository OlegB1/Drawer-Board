const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path')

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '')));

http.listen(PORT, () => console.log(`Listening on ${ PORT }`));

let history = [];
io.on('connection', (socket) => {
    socket.on('drawLine', (data) => {
        if (data != 'getData' && data) {
            history.push(data)
            io.emit('drawLine', history);
        } else if (data == 'getData') {
            io.emit('drawLine', history);
        } else if (!data) {
            history = [];
            io.emit('drawLine', '');
        }
    });
    socket.on('restore', (data) => {
        history.splice(history.length - data.stage, data.stage);
        history.push(data.mouseCordinates);
        socket.emit('drawLine', history)
    })
});