import { ConnectedUserType, RoomType } from '@src/types';
import { v4 as uuidv4 } from 'uuid';
const createNewRoom = ({
  connectedUsers,
  rooms,
  userName,
  socketId,
}: {
  connectedUsers: ConnectedUserType[];
  rooms: RoomType[];
  userName: string;
  socketId: string;
}) => {
  const roomId = uuidv4();

  const newUser: ConnectedUserType = {
    name: userName,
    id: uuidv4(),
    socketId: socketId,
    roomId,
  };

  const updatedConnectedUsers = [...connectedUsers, newUser];

  const newRoom: RoomType = {
    id: roomId,
    chat: [],
    participants: [newUser],
  };

  const updatedRooms = [...rooms, newRoom];

  return { newRoom, updatedConnectedUsers, updatedRooms };
};

export default createNewRoom;
