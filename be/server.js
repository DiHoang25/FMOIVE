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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.locals.io = io;

const employeeSockets = new Map(); // username -> socket.id
const userSockets = new Map();     // username -> Set<socket.id>

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);

socket.on("register", (data) => {
  const username = data?.username || data;
  const role = data?.role || 'customer';

  if (!username) return;

  socket.username = username;
  socket.role = role;

  socket.join(username);
  console.log(`✅ ${username} (role: ${role}) đã join phòng '${username}'`);

  if (role === 'employee') {
    employeeSockets.set(username, socket.id);
  } else {
    // Nếu user đã tồn tại socket id, kiểm tra và xoá các socket đã disconnect
    if (!userSockets.has(username)) {
      userSockets.set(username, new Set());
    }
    const socketSet = userSockets.get(username);

    // Xoá các socketId không còn hợp lệ (phòng hờ reconnect hoặc refresh)
    const updatedSocketSet = new Set();
    socketSet.forEach((sockId) => {
      const sock = io.sockets.sockets.get(sockId);
      if (sock) {
        updatedSocketSet.add(sockId);
      }
    });

    updatedSocketSet.add(socket.id); // thêm socket hiện tại
    userSockets.set(username, updatedSocketSet);

    // Gửi userOnline cho tất cả nhân viên
    for (const empSocketId of employeeSockets.values()) {
      io.to(empSocketId).emit('userOnline', username);
    }
  }
});


  // User gửi tin nhắn cho nhân viên
  socket.on('sendMessageToEmployee', ({ sender, message }) => {
    console.log(`📨 Tin nhắn từ user ${sender}: ${message}`);
    for (const empSocketId of employeeSockets.values()) {
      io.to(empSocketId).emit('receiveMessage', { sender, message });
    }
  });

  // Nhân viên gửi tin nhắn cho user cụ thể
  socket.on('sendMessage', ({ sender, receiver, message }) => {
    const targetSockets = userSockets.get(receiver);
    if (targetSockets && targetSockets.size > 0) {
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
    for (const [username, id] of employeeSockets.entries()) {
      if (id === socket.id) {
        employeeSockets.delete(username);
        console.log(`❌ Nhân viên ${username} đã offline`);
        return;
      }
    }

    // Nếu là user
    for (const [username, socketSet] of userSockets.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);

        // Nếu user không còn kết nối nào
        if (socketSet.size === 0) {
          userSockets.delete(username);
          console.log(`❌ User ${username} đã offline`);

          // Gửi thông báo đến tất cả nhân viên
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
