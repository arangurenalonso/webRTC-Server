"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const create_new_room_1 = __importDefault(require("./handlers/create-new-room"));
const joinRoom_handler_1 = __importDefault(require("./handlers/joinRoom.handler"));
const user_disconnect_handler_1 = __importDefault(require("./handlers/user-disconnect.handler"));
const PORT = process.env.PORT || 5002;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((0, cors_1.default)());
let connectedUsers = [];
let rooms = [];
//Create rout to check if room exists
app.get('/api/check-room/:roomId', (req, res) => {
    const { roomId } = req.params;
    const roomExist = rooms.find((room) => room.id === roomId);
    if (roomExist) {
        if (roomExist.participants.length === 3) {
            res.json({ roomExist: true, roomFull: true });
        }
        else {
            res.json({ roomExist: true, roomFull: false });
        }
    }
    else {
        res.json({ roomExist: false }).status(404);
    }
});
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);
    socket.on('room/create', ({ userName }) => {
        const { newRoom, updatedConnectedUsers, updatedRooms } = (0, create_new_room_1.default)({
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
        const { roomId, participantName } = data;
        const resultValue = (0, joinRoom_handler_1.default)({
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
        console.log('room', room);
        io.to(roomId).emit('room/participants', {
            participants: (room === null || room === void 0 ? void 0 : room.participants) || [],
        });
        //Emit to all user which are already in this room to prepare peer connection
        room === null || room === void 0 ? void 0 : room.participants.forEach((user) => {
            if (user.socketId !== socket.id) {
                const data = {
                    offerer: socket.id,
                };
                io.to(user.socketId).emit('webRTC/prepare-connection', data);
            }
        });
    });
    socket.on('webRTC/confirm-connection', (data) => {
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
    socket.on('disconnect', () => {
        const result = (0, user_disconnect_handler_1.default)({
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
