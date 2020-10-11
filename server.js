// Cristian Soria
// Oct 02 2020
// Server.js

const express = require('express');
const app = express();
// Sets up server for the application
const server = require('http').Server(app);

const io = require('socket.io')(server);

const { v4: uuidv4 } = require('uuid');

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
})

// Changes view engine to ejs
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);


// Root URL
app.get('/', (req, res) => {
  // res.status(200).send("Hello World");
  res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
  res.render('room', { roomId: req.params.room });
});

// Socket IO
// Differs from HTTP because HTTP's server only responds but doesn't communicate with you
// Socket IO servers communicates with you and you can communicate wit them (It creates a channel for communication)
io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);
    socket.on('message', message => {
      io.to(roomId).emit('createMessage', message);
    })
  });
});

server.listen(process.env.PORT || 443);
