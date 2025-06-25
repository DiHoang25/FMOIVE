const mongoose = require('mongoose');
const Room = require('../../models/room'); // Import mô hình Room
const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/authMiddleware'); // Import middleware xác thực JWT
const adminMiddleware = require('../../middleware/adminMiddleware'); // Import middleware kiểm tra quyền quản trị viên

// @route   Post /api/theater/rooms
// @desc    Tạo một phòng mới
// @access  Private (Chỉ dành cho quản trị viên)

router.post('/new_room', authMiddleware, adminMiddleware, async (req, res) => {
    const { roomId, roomName, quantity, roomType } = req.body;
    try {
        // Kiểm tra các trường bắt buộc
        if (!roomName || !quantity || !roomType) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên phòng, số lượng ghế và loại phòng.' });
        }
        // Tạo một phòng mới
        const newRoom = new Room({
            roomId,
            roomName,
            quantity,
            roomType
        });

        // Lưu phòng vào cơ sở dữ liệu
        await newRoom.save();

        res.status(201).json({
            message: 'Phòng mới đã được tạo thành công.',
        });
    } catch (error) {
        console.error('Lỗi khi tạo phòng:', error.message);
        res.status(500).send('Lỗi máy chủ khi tạo phòng.');
    }
});

// @route   GET /api/theater/rooms
// @desc    Lấy danh sách tất cả các phòng
// @access  Private (Chỉ dành cho quản trị viên)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        // Lấy danh sách tất cả các phòng
        const rooms = await Room.find().select('-__v'); // Loại bỏ trường __v để giảm bớt dữ liệu trả về

        res.status(200).json({
            message: 'Lấy danh sách phòng thành công.',
            rooms
        });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng:', error.message);
        res.status(500).send('Lỗi máy chủ khi lấy danh sách phòng.');
    }
});



module.exports = router;
