import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Rate, Input, Button, message as antdMessage } from 'antd'
import { SendOutlined, MessageOutlined } from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import '../index.css' // Import Tailwind hoặc custom CSS
import { StarFilled } from '@ant-design/icons'
import { Modal } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'


const desc = ['Terrible', 'Bad', 'Normal', 'Good', 'Wonderful']

const CommentSection = ({ movieName }) => {
    const { user } = useAuth() // ✅ Lấy user trực tiếp từ context
    const navigate = useNavigate()
    const location = useLocation()

    const [comments, setComments] = useState([])
    const [message, setMessage] = useState('')
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)


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
            setIsLoginModalOpen(true)
            return
        }


        if (!message.trim() || rating === 0) {
            antdMessage.error('Please enter content and select star rating.')
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
            antdMessage.success('Comment successful!')
        } catch (err) {
            console.error(err)
            antdMessage.error('Error sending comment')
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
                    <MessageOutlined className="icon" /> Comment
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
                    placeholder="Share your feelings about this movie..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="comment-textarea"
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading}
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
                        ⚠️ Please login to comment
                    </div>
                )}
            </div>

            {/* Comment List */}
            <div className="comment-card">
                <h3 className="card-title">
                    <StarFilled className="text-yellow-400 mr-2" /> Rating
                </h3>
                {comments.length === 0 ? (
                    <p className="no-comments">No comment yet</p>
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

            <Modal
                open={isLoginModalOpen}
                onCancel={() => setIsLoginModalOpen(false)}
                footer={null}
                centered
                width={500}
                className="custom-modal"
            >
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-2xl text-center">
                    {/* Tiêu đề cảnh báo */}
                    <div className="text-yellow-400 text-xl font-semibold mb-4 flex justify-center items-center gap-2">
                        ⚠️ Please login to comment
                    </div>

                    {/* Nút đăng nhập */}
                    {/* Nút đăng nhập bằng navigate để truyền state */}
                    <button
                        onClick={() => navigate('/login', { state: { from: location.pathname } })}
                        className="w-full block bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] mb-4"
                    >
                        Login Here
                    </button>


                    {/* Nút đóng */}
                    <button
                        onClick={() => setIsLoginModalOpen(false)}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 rounded-lg transition-all duration-200"
                    >
                        Close
                    </button>
                </div>
            </Modal>



        </div>
    )
}

export default CommentSection
