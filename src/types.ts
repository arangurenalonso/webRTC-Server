export type ConnectedUserType = {
  id: string;
  name: string;
  socketId: string;
  roomId: string;
};

export type RoomType = {
  id: string;
  participants: ConnectedUserType[];
};

export type SuccessResponse = {
  isOk: true;
  result: {
    updatedConnectedUsers: ConnectedUserType[];
    updatedRoom: RoomType[];
  };
};

export type ErrorResponse = {
  isOk: false;
  msg: string;
};
export type JoinRoomResponse = SuccessResponse | ErrorResponse;
