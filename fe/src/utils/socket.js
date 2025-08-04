import { io } from 'socket.io-client';

const socket = io("http://10.88.54.29:5000", {
  transports: ["websocket"],
  withCredentials: true,
})

export default socket;
