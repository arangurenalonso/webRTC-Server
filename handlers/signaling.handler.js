const signalingHandler = (data, socket, io) => {
  const { signal, connectedUsersSocketId: connectedSenderUserSocketId } = data;
  const signalingData = {
    signal,
    connectedUsersSocketId: socket.id,
  };
  io.to(connectedSenderUserSocketId).emit('signal-peer', signalingData);
};

module.exports = signalingHandler;
