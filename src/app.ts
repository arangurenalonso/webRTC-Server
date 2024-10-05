import express from 'express';
import http from 'http';
import cors from 'cors';
import { ConnectedUserType, MessageType, RoomType } from './types';
import { Server, Socket } from 'socket.io';
import createNewRoom from './handlers/create-new-room';
import joinRoomHandler from './handlers/joinRoom.handler';
import handleUserDisconnect from './handlers/user-disconnect.handler';
import createNewMessage from './handlers/create-new-message';

const PORT = process.env.PORT || 5002;

const app = express();

const server = http.createServer(app);
app.use(cors());

let connectedUsers: ConnectedUserType[] = [];
let rooms: RoomType[] = [];

//Create rout to check if room exists
app.get('/api/check-room/:roomId', (req, res) => {
  const { roomId } = req.params;

  const roomExist = rooms.find((room) => room.id === roomId);
  if (roomExist) {
    if (roomExist.participants.length === 3) {
      res.json({ roomExist: true, roomFull: true });
    } else {
      res.json({ roomExist: true, roomFull: false });
    }
  } else {
    res.json({ roomExist: false }).status(404);
  }
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket: Socket) => {
  console.log(`A user connected: ${socket.id}`);
  socket.on('room/create', ({ userName }: { userName: string }) => {
    console.log('room/create');
    console.log('roms', rooms);

    const { newRoom, updatedConnectedUsers, updatedRooms } = createNewRoom({
      connectedUsers,
      rooms,
      userName,
      socketId: socket.id,
    });

    connectedUsers = updatedConnectedUsers;
    rooms = updatedRooms;

    socket.join(newRoom.id);
    socket.emit('room/join', { roomId: newRoom.id });
    socket.emit('room/participants', { participants: newRoom.participants });
  });
  socket.on('room/join', (data) => {
    console.log('room/join');
    const { roomId, participantName } = data;
    const resultValue = joinRoomHandler({
      connectedUsers,
      rooms,
      participantName,
      socketId: socket.id,
      roomIdToJoin: roomId,
    });
    if (!resultValue.isOk) {
      socket.emit('room/join-error', { msg: resultValue.msg });
      return;
    }
    const { updatedConnectedUsers, updatedRoom } = resultValue.result;

    connectedUsers = updatedConnectedUsers;
    rooms = updatedRoom;

    socket.join(roomId);
    socket.emit('room/join', { roomId });
    const room = rooms.find((room) => room.id === roomId);

    io.to(roomId).emit('room/participants', {
      participants: room?.participants || [],
    });
    socket.emit('chat/messages', {
      messages: room?.chat || [],
    });
    //Emit to all user which are already in this room to prepare peer connection
    room?.participants.forEach((user) => {
      if (user.socketId !== socket.id) {
        const data = {
          offerer: socket.id,
        };
        io.to(user.socketId).emit('webRTC/prepare-connection', data);
      }
    });
  });
  socket.on('room/leave', () => {
    console.log('room/leave');
    const result = handleUserDisconnect({
      connectedUsers,
      rooms,
      io,
      socket,
    });
    if (!result.isOk) {
      return;
    }
    const { updatedConnectedUsers, updatedRoom } = result.result;
    connectedUsers = updatedConnectedUsers;
    rooms = updatedRoom;
  });
  socket.on('webRTC/confirm-connection', (data) => {
    console.log('webRTC/confirm-connection');

    const { offerer } = data;

    const initData = {
      answerer: socket.id,
    };
    io.to(offerer).emit('webRTC/confirm-connection', initData);
  });
  socket.on('webRTC/signal-exchange', (data) => {
    /**
     * En el contexto de WebRTC, un peer es una instancia de la conexión entre dos dispositivos o "pares" (de ahí el nombre "peer"). Específicamente, un peer representa un nodo participante en una comunicación directa entre dos navegadores o aplicaciones que utilizan WebRTC para intercambiar audio, video, o datos.
     * Peer se refiere a uno de los extremos de la conexión. 
        Una conexión WebRTC se establece entre dos "peers" o pares, que pueden ser dos navegadores, dos aplicaciones móviles, o cualquier otro dispositivo que soporte WebRTC.
     * En este sentido puede ser el offered o el reciver que anteriormente han hecho una conexion y que estan cambiando información
     */
    const { signal, peerSocketId } = data;
    const signalingData = {
      signal,
      peerSocketId: socket.id,
    };
    io.to(peerSocketId).emit('webRTC/signal-exchange', signalingData);
  });
  socket.on('chat/new-message', (data) => {
    console.log('chat/new-message');
    const resultValue = createNewMessage({
      connectedUsers,
      rooms,
      socketId: socket.id,
      message: data.message,
    });

    if (!resultValue.isOk) {
      socket.emit('chat/new-message-error', { msg: resultValue.msg });
      return;
    }
    const { updatedRoom, roomId, newMessage } = resultValue.result;

    rooms = updatedRoom;
    io.to(roomId).emit('chat/new-message', {
      message: newMessage,
    });
  });

  socket.on('disconnect', () => {
    console.log('disconnect');

    const result = handleUserDisconnect({
      connectedUsers,
      rooms,
      io,
      socket,
    });
    if (!result.isOk) {
      return;
    }
    const { updatedConnectedUsers, updatedRoom } = result.result;
    connectedUsers = updatedConnectedUsers;
    rooms = updatedRoom;
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
