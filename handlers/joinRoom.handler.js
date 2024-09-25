const { v4: uuidv4 } = require('uuid');
const joinRoomHandler = (connectedUsers, rooms, data, socket, io) => {
  const { identity, roomId } = data;
  /*
    Modificación por referencia: En JavaScript, cuando obtienes un objeto de un array, por el metodo find()
    el objeto que obtienes es una referencia al objeto original. Por lo tanto, cualquier cambio que realices en el objeto de referencia afectará al objeto original. Esto significa que cualquier cambio que realices en room está afectando directamente al objeto dentro de rooms, porque ambos apuntan al mismo lugar en memoria.
   */
  const room = rooms.find((x) => x.id === roomId);
  if (!room) {
    socket.emit('room-not-exists', { roomId });
    return { connectedUsers, rooms };
  }
  if (room.connectedUsers.length > 3) {
    socket.emit('room-full', { roomId });
    return { connectedUsers, rooms };
  }
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
  };

  const userExist = room.connectedUsers.find((x) => x.identity === identity);
  if (!userExist) {
    connectedUsers = [...connectedUsers, newUser];
  }

  const userConnectedToTheRoom = room.connectedUsers.find(
    (x) => x.identity === identity
  );

  if (!userConnectedToTheRoom) {
    room.connectedUsers = [...room.connectedUsers, newUser];
  }
  /**
   Reasignación innecesaria: Al final, haces una reasignación de rooms con:
    rooms = rooms.map((x) => {
      if (x.id === roomId) {
        return room;
      }
      return x;
    });
  
   */

  socket.join(roomId);
  socket.emit('room-id', { roomId });
  const roomParticipats = {
    roomId,
    connectedUsers: room.connectedUsers.map((x) => {
      return { name: x.identity, id: x.id };
    }),
  };
  //Emit to all user which are already in this room to prepare peer connection

  room.connectedUsers.forEach((user) => {
    if (user.socketId !== socket.id) {
      const data = {
        connectedUsersSocketId: socket.id,
      };
      io.to(user.socketId).emit('prepare-peer-connection', data);
    }
  });
  io.to(roomId).emit('room-participants', roomParticipats);
  return { connectedUsers, rooms };
};

module.exports = joinRoomHandler;
