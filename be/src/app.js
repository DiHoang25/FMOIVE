const express = require('express');
const cors = require('cors'); // Import cors để xử lý Cross-Origin Resource Sharing
require('dotenv').config();


// Import các tuyến (routes) từ thư mục routes
const authRoutes = require('./routes/authentication/auth'); 
const profileRoutes = require('./routes/userFeature/profileRoutes');
const featureRoutes = require('./routes/userFeature/profileRoutes'); // Import các tuyến người dùng
const customerManagementRoutes = require('./routes/admin/customerRoutes');
const employeeManagementRoutes = require('./routes/admin/employeeRoutes');
const uploadRoutes = require('./routes/movie/uploadRoute');
const movieRoutes = require('./routes/movie/movieRoutes');
const homepageRoutes = require('./routes/movie/homepageRoutes');
const promotionRoutes = require('./routes/promotions/promotionsRoutes');
// Khởi tạo ứng dụng Express

const app = express();

// Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(cors());
// Sử dụng express.json() để phân tích cú pháp các yêu cầu JSON từ client
app.use(express.json());

// Định nghĩa các tuyến (routes) API
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/feature', featureRoutes);
app.use('/api/admin/customers', customerManagementRoutes);
app.use('/api/admin/employees', employeeManagementRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/home', homepageRoutes);
app.use('/api/promotions', promotionRoutes)


// // Tuyến mặc định cho kiểm tra server
// app.get('/', (req, res) => {
//     res.send('Chào mừng đến với API Backend Đăng nhập!');
// });

// // Khởi động server
// app.listen(PORT, () => {
//     console.log(`Server đang chạy trên cổng ${PORT}`);
//     console.log(`Swagger Docs tại: http://localhost:${PORT}/api-docs`);
// });
module.exports = app;
