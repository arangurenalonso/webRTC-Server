export type ConnectedUserType = {
  id: string;
  name: string;
  socketId: string;
  roomId: string;
};
export type MessageType = {
  id: string;
  user: ConnectedUserType;
  message: string;
  time: Date;
};
export type RoomType = {
  id: string;
  participants: ConnectedUserType[];
  chat: MessageType[];
};

export type SuccessResponse = {
  isOk: true;
  result: {
    updatedConnectedUsers: ConnectedUserType[];
    updatedRoom: RoomType[];
  };
};
export type SuccessNewMessageResponse = {
  isOk: true;
  result: {
    updatedConnectedUsers: ConnectedUserType[];
    updatedRoom: RoomType[];
    newMessage: MessageType;
    roomId: string;
  };
};

export type ErrorResponse = {
  isOk: false;
  msg: string;
};
export type JoinRoomResponse = SuccessResponse | ErrorResponse;
