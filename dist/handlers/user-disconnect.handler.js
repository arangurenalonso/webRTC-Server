"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleUserDisconnect = ({ connectedUsers, rooms, io, socket, }) => {
    var _a;
    // Encontrar al usuario desconectado en la lista de usuarios conectados
    const userIndex = connectedUsers.findIndex((user) => user.socketId === socket.id);
    if (userIndex === -1) {
        return {
            isOk: false,
            msg: `user dosen't existe in the room`,
        };
    }
    const user = connectedUsers[userIndex];
    const roomId = user.roomId;
    // Remover al usuario de la lista de conectados
    const updatedConnectedUsers = connectedUsers.filter((user) => user.socketId !== socket.id);
    // Encontrar el room correspondiente
    const room = rooms.find((room) => room.id === roomId);
    if (room) {
        // Remover al usuario de la lista de usuarios conectados al room
        room.participants =
            ((_a = room === null || room === void 0 ? void 0 : room.participants) === null || _a === void 0 ? void 0 : _a.filter((u) => u.socketId !== socket.id)) || [];
        socket.leave(roomId);
        // Verificar si el room está vacío
        if (room.participants.length === 0) {
            // Si no hay usuarios conectados, eliminar el room
            rooms = rooms.filter((r) => r.id !== roomId);
            console.log(`Room ${roomId} has been closed as it's empty`);
        }
        else {
            //Emit to all users which are still in the room that user disconnected
            io.to(roomId).emit('user-disconnected', {
                socketIdUserDisconnected: socket.id,
            });
            // Si aún hay usuarios en el room, notificar a los demás usuarios
            io.to(roomId).emit('room/participants', {
                participants: room.participants,
            });
        }
    }
    return {
        isOk: true,
        result: {
            updatedConnectedUsers: updatedConnectedUsers,
            updatedRoom: rooms,
        },
    };
};
exports.default = handleUserDisconnect;
