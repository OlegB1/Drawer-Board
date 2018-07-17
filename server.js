const express = require('express');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path')

const PORT = process.env.PORT || 8080;

app
    .use(express.static(path.join(__dirname, '')))
    .set('views', path.join(__dirname, ''))
    .set('view engine', 'ejs')
    .get('/', (req, res, next) => res.sendFile(path.join(__dirname, 'index.html')));

http.listen(PORT, () => console.log(`Listening on ${ PORT }`))

let history = [];
io.on('connection', function (socket) {
    socket.on('drawLine', function (data) {
        if (data != 'start' && data) {
            history.push(data)
            io.emit('drawLine', history);
        } else if (data == 'start') {
            io.emit('drawLine', history);
        } else if (!data) {
            history = [];
            io.emit('drawLine', '');
        }
    });
});