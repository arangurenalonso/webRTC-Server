const { v4: uuidv4 } = require('uuid');
const createNewRoom = (connectedUsers, rooms, identity, socket, io) => {
  const roomId = uuidv4();
  const newUser = {
    identity,
    id: uuidv4(),
    socketId: socket.id,
    roomId,
  };

  const updatedConnectedUsers = [...connectedUsers, newUser];

  const newRoom = {
    id: roomId,
    connectedUsers: [newUser],
  };

  const updatedRooms = [...rooms, newRoom];

  socket.join(roomId);
  console.log('roomid', roomId);

  socket.emit('room-id', { roomId });

  const roomParticipants = {
    roomId,
    connectedUsers: newRoom.connectedUsers.map((x) => {
      return { name: x.identity, id: x.id };
    }),
  };

  socket.emit('room-participants', roomParticipants);

  // Retornar los nuevos valores de connectedUsers y rooms
  return { updatedConnectedUsers, updatedRooms };
};

module.exports = createNewRoom;
