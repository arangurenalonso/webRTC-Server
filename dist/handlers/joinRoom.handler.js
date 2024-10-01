"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { v4: uuidv4 } = require('uuid');
const joinRoomHandler = ({ connectedUsers, rooms, roomIdToJoin, participantName, socketId, }) => {
    /*
      Modificación por referencia: En JavaScript, cuando obtienes un objeto de un array, por el metodo find()
      el objeto que obtienes es una referencia al objeto original. Por lo tanto, cualquier cambio que realices en el objeto de referencia afectará al objeto original. Esto significa que cualquier cambio que realices en room está afectando directamente al objeto dentro de rooms, porque ambos apuntan al mismo lugar en memoria.
     */
    const room = rooms.find((x) => x.id === roomIdToJoin);
    if (!room) {
        return { isOk: false, msg: 'Room not exists' };
    }
    if (room.participants.length > 3) {
        return { isOk: false, msg: 'Room is full' };
    }
    const userHasConnected = connectedUsers.find((x) => x.socketId === socketId);
    if (userHasConnected) {
        return {
            isOk: false,
            msg: `You already connected to the room ${userHasConnected.roomId}`,
        };
    }
    const participantExist = room.participants.find((x) => x.socketId === socketId);
    if (participantExist) {
        return { isOk: false, msg: 'You are already in this room' };
    }
    const newUser = {
        name: participantName,
        id: uuidv4(),
        socketId: socketId,
        roomId: roomIdToJoin,
    };
    const updatedConnectedUsers = [...connectedUsers, newUser];
    const updatedRoom = rooms.map((x) => {
        if (x.id === roomIdToJoin) {
            return Object.assign(Object.assign({}, x), { participants: [...x.participants, newUser] });
        }
        return x;
    });
    return {
        isOk: true,
        result: { updatedConnectedUsers, updatedRoom },
    };
};
exports.default = joinRoomHandler;
