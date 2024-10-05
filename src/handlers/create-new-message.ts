import {
  ConnectedUserType,
  ErrorResponse,
  MessageType,
  RoomType,
} from '@src/types';
import { v4 as uuidv4 } from 'uuid';

export type SuccessNewMessageResponse = {
  isOk: true;
  result: {
    updatedRoom: RoomType[];
    newMessage: MessageType;
    roomId: string;
  };
};
const createNewMessage = ({
  connectedUsers,
  rooms,
  message,
  socketId,
}: {
  connectedUsers: ConnectedUserType[];
  rooms: RoomType[];
  message: string;
  socketId: string;
}): ErrorResponse | SuccessNewMessageResponse => {
  const sender = connectedUsers.find((user) => user.socketId === socketId);
  if (!sender) {
    return {
      isOk: false,
      msg: 'Not sender found',
    };
  }
  const roomId = sender.roomId;
  const roomIndex = rooms.findIndex((room) => room.id === roomId);
  if (roomIndex === -1) {
    return {
      isOk: false,
      msg: 'Room not found',
    };
  }
  const newMessage: MessageType = {
    id: uuidv4(),
    user: sender,
    message: message,
    time: new Date(),
  };
  const updatedRooms = [...rooms];
  updatedRooms[roomIndex] = {
    ...rooms[roomIndex],
    chat: [...rooms[roomIndex].chat, newMessage],
  };
  return {
    isOk: true,
    result: {
      updatedRoom: updatedRooms,
      newMessage: newMessage,
      roomId: roomId,
    },
  };
};

export default createNewMessage;
