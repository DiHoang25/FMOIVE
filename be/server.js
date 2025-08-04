const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const connectDB = require('./src/config/dbconfig');
const app = require('./src/app');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5000;

connectDB();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.locals.io = io;

// Bản đồ lưu socket
const employeeSockets = new Map();             // employeeUsername -> socketId
const userSockets = new Map();                 // username -> Set<socketId>
const latestUserSocket = new Map();            // username -> latest socketId

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on("register", (data) => {
    const username = data?.username || data;
    const role = data?.role || 'customer';
    if (!username) return;

    socket.username = username;
    socket.role = role;

    // Tham gia vào phòng cá nhân
    if (!socket.rooms.has(username)) {
      socket.join(username);
      console.log(`✅ ${username} (role: ${role}) đã join phòng '${username}'`);
    }

// Thay đoạn trong socket.on("register", ...) bằng đoạn này:

if (role === 'employee') {
  employeeSockets.set(username, socket.id);
} else {
  const existingSockets = userSockets.get(username) || new Set();

  for (const oldSocketId of existingSockets) {
    if (oldSocketId !== socket.id) {
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) {
        oldSocket.emit("forceLogout", {
          message: "Tài khoản đã đăng nhập ở thiết bị khác.",
        });
        console.log(`🔁 Đã đăng xuất socket cũ của ${username}: ${oldSocketId}`);
        oldSocket.disconnect(true);
      }
    }
  }

  // Cập nhật lại danh sách socket (xóa hết cũ và thêm socket hiện tại)
  const newSocketSet = new Set();
  newSocketSet.add(socket.id);
  userSockets.set(username, newSocketSet);

  for (const empSocketId of employeeSockets.values()) {
    io.to(empSocketId).emit('userOnline', username);
  }
}

  });

  socket.on('sendMessageToEmployee', ({ sender, message }) => {
    console.log(`📨 Tin nhắn từ user ${sender}: ${message}`);
    for (const empSocketId of employeeSockets.values()) {
      io.to(empSocketId).emit('receiveMessage', { sender, message });
    }
  });

  socket.on('sendMessage', ({ sender, receiver, message }) => {
    const targetSockets = userSockets.get(receiver);
    if (targetSockets?.size) {
      for (const sockId of targetSockets) {
        io.to(sockId).emit('receiveMessage', { sender, message });
      }
      console.log(`📤 Nhân viên ${sender} gửi tin nhắn đến ${receiver}: ${message}`);
    } else {
      console.log(`⚠️ Không tìm thấy socket của ${receiver}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);

    // Nếu là nhân viên
    for (const [emp, sockId] of employeeSockets.entries()) {
      if (sockId === socket.id) {
        employeeSockets.delete(emp);
        console.log(`❌ Nhân viên ${emp} đã offline`);
        return;
      }
    }

    // Nếu là user
    for (const [username, socketSet] of userSockets.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);

        if (socketSet.size === 0) {
          userSockets.delete(username);
          latestUserSocket.delete(username);
          console.log(`❌ User ${username} đã offline`);

          for (const empSocketId of employeeSockets.values()) {
            io.to(empSocketId).emit('userOffline', username);
          }
        }
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📄 Swagger Docs tại: http://localhost:${PORT}/api-docs`);
});
