"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const createNewRoom = ({ connectedUsers, rooms, userName, socketId, }) => {
    const roomId = (0, uuid_1.v4)();
    const newUser = {
        name: userName,
        id: (0, uuid_1.v4)(),
        socketId: socketId,
        roomId,
    };
    const updatedConnectedUsers = [...connectedUsers, newUser];
    const newRoom = {
        id: roomId,
        participants: [newUser],
    };
    const updatedRooms = [...rooms, newRoom];
    return { newRoom, updatedConnectedUsers, updatedRooms };
};
exports.default = createNewRoom;
