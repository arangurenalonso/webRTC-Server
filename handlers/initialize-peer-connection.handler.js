//information from clients which are already in room that they have prepared for incoming connection
const initializePeerConnectionHandler = (
  connectedUsersSocketId,
  socket,
  io
) => {
  const initData = {
    connectedUsersSocketId: socket.id,
  };
  io.to(connectedUsersSocketId).emit('peer-connection-initialize', initData);
};

module.exports = initializePeerConnectionHandler;
