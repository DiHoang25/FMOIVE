import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Rate, Input, Button, message as antdMessage } from 'antd'
import { SendOutlined, MessageOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import '../index.css' // Import Tailwind hoặc custom CSS

const desc = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful']

const CommentSection = ({ movieName }) => {
    const { user } = useAuth() // ✅ Lấy user trực tiếp từ context

    const [comments, setComments] = useState([])
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(false)

    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments?movieName=${movieName}`)
            setComments(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    useEffect(() => {
        if (movieName) fetchComments()
    }, [movieName])

    const handleSubmit = async () => {
        if (!user) {
            antdMessage.warning('Bạn cần đăng nhập để bình luận!')
            return
        }

        if (!message.trim() || rating === 0) {
            antdMessage.error('Vui lòng nhập nội dung và chọn sao đánh giá.')
            return
        }

        setLoading(true)
        try {
            await axios.post(`http://localhost:5000/api/comments`, {
                movieName,
                author: user.username,
                message,
                rating,
            })
            setMessage('')
            setRating(0)
            fetchComments()
            antdMessage.success('Bình luận thành công!')
        } catch (err) {
            console.error(err)
            antdMessage.error('Lỗi gửi bình luận')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })

    return (
        <div className="comment-container">
            {/* Form */}
            <div className="comment-card">
                <h3 className="card-title">
                    <MessageOutlined className="icon" /> Viết đánh giá
                </h3>

                <div className="rating-box">
                    <Rate
                        tooltips={desc}
                        onChange={setRating}
                        value={rating}
                        className="custom-rate"
                    />
                    {rating ? <div className="rating-label">{desc[rating - 1]}</div> : null}
                </div>

                <Input.TextArea
                    rows={4}
                    placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="comment-textarea"
                />
                <button
                    onClick={handleSubmit}
                    disabled={!user || loading}
                    className="comment-button flex items-center justify-center gap-2"
                >
                    {loading ? 'Đang gửi...' : (
                        <>
                            <SendOutlined className="text-base" />
                            <span>Post Comment</span>
                        </>
                    )}
                </button>




                {!user && (
                    <div className="login-reminder">
                        ⚠️ Vui lòng đăng nhập để bình luận
                    </div>
                )}
            </div>

            {/* Comment List */}
            <div className="comment-card">
                <h3 className="card-title">
                    <MessageOutlined className="icon" /> Bình luận
                </h3>
                {comments.length === 0 ? (
                    <p className="no-comments">Chưa có bình luận nào</p>
                ) : (
                    <div className="comment-list">
                        {comments.map((c) => (
                            <div key={c._id} className="comment-item">
                                <div className="avatar">
                                    <img
                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.author}`}
                                        alt={c.author}
                                    />
                                </div>
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <strong>{c.author}</strong>
                                        <Rate disabled value={c.rating} className="small-rate" />
                                        <span className="badge">{desc[c.rating - 1]}</span>
                                        <span className="date">{formatDate(c.createdAt)}</span>
                                    </div>
                                    <p>{c.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CommentSection
