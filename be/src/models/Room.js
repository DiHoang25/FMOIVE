const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import mô hình Counter để sử dụng bộ đếm số tuần tự

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    unique: true,
    trim: true
  },
    roomName: {
        type: String,
        required: [true, 'Tên phòng là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên phòng không được vượt quá 100 ký tự']
    },
    quantity: {
        type: Number,
        required: [true, 'Số lượng ghế là bắt buộc'],
        min: [1, 'Số lượng ghế phải lớn hơn 0'],
        max: [500, 'Số lượng ghế không được vượt quá 500']
    },
    roomType: {
        type: String,
        required: [true, 'Loại phòng là bắt buộc'],
        enum: ['2D', '3D', 'imax'], // Ví dụ: chỉ cho phép các loại phòng này
    },
    }, {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    collection: 'room' // chỉnh sửa collection trong MongoDB ở đây
});

roomSchema.pre('save', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'roomId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      this.roomId = 'ROOM' + String(counter.seq).padStart(9, '0');
    } catch (error) {
      return next(error); // Chuyển lỗi nếu không thể tạo Id
    }
  }
});

module.exports = mongoose.model('Room', roomSchema);
