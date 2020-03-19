const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '')));

http.listen(PORT, () => console.log(`Listening on ${PORT}`));

let history = [];
io.on('connection', socket => {
    socket.on('saveCoordinates', data => {
        if (data) {
            history.push(data);
            io.emit('drawLine', [data]);
            return;
        }
        history = [];
        io.emit('drawLine', '');
    });

    socket.on('getData', () => {
        io.emit('drawLine', history);
    })
});
