const express = require('express');
const http = require('http');
const cors = require('cors');
const {
  handleUserDisconnect,
  createNewRoom,
  joinRoomHandler,
  signalingHandler,
  initializePeerConnectionHandler,
} = require('./handlers'); // Usar require en lugar de import

const PORT = process.env.PORT || 5002;

const app = express();

const server = http.createServer(app);
app.use(cors());

let connectedUsers = [];
let rooms = [];

//Create rout to check if room exists
app.get('/api/check-room/:roomId', (req, res) => {
  const { roomId } = req.params;

  const roomExist = rooms.find((room) => room.id === roomId);
  if (roomExist) {
    if (roomExist.connectedUsers.length === 3) {
      res.json({ roomExist: true, roomFull: true });
    } else {
      res.json({ roomExist: true, roomFull: false });
    }
  } else {
    res.json({ roomExist: false }).status(404);
  }
});

const io = require('socket.io')(server, {
  cors: {
    // origin: 'http://localhost:5173', // Permite al frontend conectar
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on('create-new-room', (data) => {
    console.log('create-new-room data', data);

    const { identity } = data;
    const { updatedConnectedUsers, updatedRooms } = createNewRoom(
      connectedUsers,
      rooms,
      identity,
      socket,
      io
    );

    connectedUsers = updatedConnectedUsers;
    rooms = updatedRooms;
  });
  socket.on('join-room', (data) => {
    console.log('join-room data', data);
    const { connectedUsers: updatedUsers, rooms: updatedRooms } =
      joinRoomHandler(connectedUsers, rooms, data, socket, io);
    connectedUsers = updatedUsers;
    rooms = updatedRooms;
  });
  socket.on('disconnect', () => {
    console.log(`disconnect`, `user: ${socket.id}`);
    const { connectedUsers: updatedUsers, rooms: updatedRooms } =
      handleUserDisconnect(connectedUsers, rooms, socket, io);
    connectedUsers = updatedUsers;
    rooms = updatedRooms;
  });
  socket.on('signal-peer', (data) => {
    console.log('signal-peer', data);

    signalingHandler(data, socket, io);
  });
  socket.on('peer-connection-initialize', (data) => {
    console.log('peer-connection-initialize', data);

    const { connectedUsersSocketId } = data;

    initializePeerConnectionHandler(connectedUsersSocketId, socket, io);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
