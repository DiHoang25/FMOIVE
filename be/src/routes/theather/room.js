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
    const { roomId, roomName, quantity, roomType, is_deleted } = req.body;
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
            roomType,
            is_deleted
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

// @route   PATCH /api/user-management/users/:userId/delete
// @desc    đập phòng (chuyển is_deleted = true)
// @access  Private (Chỉ Admin)
router.delete('/:roomId/delete', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const room = await Room.findOne({ roomId: req.params.roomId });

        if (!room) {
            return res.status(404).json({ message: 'Không tìm thấy phòng.' });
        }

        if (room.is_deleted) {
            return res.status(400).json({ message: 'Phòng này đã bị đập.' });
        }

        // Cập nhật trạng thái is_deleted thành true
        room.is_deleted = true;
        // Optionally, also deactivate the user when they are soft-deleted
        room.is_actived = false;
        await room.save();

        res.status(200).json({
            message: `Phòng "${room.roomId}" đã được san lấp.`,
        });

    } catch (error) {
        console.error('Lỗi khi đập phòng:', error.message);
        res.status(500).send('Lỗi máy chủ khi đập phòng.');
    }
});



module.exports = router;
