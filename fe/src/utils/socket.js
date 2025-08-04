import { io } from 'socket.io-client';

const SERVER_URL = "http://10.88.54.58:5000";

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getDeviceId() {
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem("deviceId", deviceId);
  }
  return deviceId;
}

function setNewDeviceId() {
  const newId = generateUUID();
  localStorage.setItem("deviceId", newId);
  return newId;
}

// Hàm khởi tạo socket, có thể dùng lại sau khi đăng nhập
export function createSocket(newDevice = false) {
  const deviceId = newDevice ? setNewDeviceId() : getDeviceId();
  const socket = io(SERVER_URL, {
    transports: ["websocket"],
    withCredentials: true,
    query: { deviceId },
  });
  return socket;
}

// Socket mặc định
const socket = createSocket();
export default socket;
