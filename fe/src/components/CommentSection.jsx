"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { Rate, Input, Button, message as antdMessage, Modal, Avatar, Divider, Space, Tag } from "antd"
import {
    SendOutlined,
    MessageOutlined,
    StarFilled,
    DeleteOutlined,
    UserOutlined,
    ClockCircleOutlined,
    CommentOutlined,
    HeartOutlined,
} from "@ant-design/icons"
import { useAuth } from "../contexts/AuthContext"
import { useLocation, useNavigate } from "react-router-dom"
import "../index.css"

const desc = ["Terrible", "Bad", "Normal", "Good", "Wonderful"]
const ratingColors = ["#ff4d4f", "#ff7a45", "#ffa940", "#52c41a", "#1890ff"]

const CommentSection = ({ movieName }) => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [comments, setComments] = useState([])
    const [message, setMessage] = useState("")
    const [rating, setRating] = useState(0)
    const [loading, setLoading] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
    const [replyInputs, setReplyInputs] = useState({})
    const [replies, setReplies] = useState({})
    const [showReplyForm, setShowReplyForm] = useState({})
    const [likedComments, setLikedComments] = useState({})


    const fetchComments = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments?movieName=${movieName}`)
            setComments(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchReplies = async (commentId) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/replies/${commentId}`)
            setReplies((prev) => ({ ...prev, [commentId]: res.data }))
        } catch (err) {
            console.error("Fetch replies error", err)
        }
    }

    useEffect(() => {
        if (movieName) fetchComments()
    }, [movieName])

    useEffect(() => {
        comments.forEach((comment) => fetchReplies(comment._id))
    }, [comments])

    const handleSubmit = async () => {
        if (!user) return setIsLoginModalOpen(true)
        if (!message.trim() || rating === 0) {
            return antdMessage.error("Please enter content and select star rating.")
        }
        setLoading(true)
        try {
            await axios.post(`http://localhost:5000/api/comments`, {
                movieName,
                author: user.username,
                message,
                rating,
            })
            setMessage("")
            setRating(0)
            fetchComments()
            antdMessage.success("Comment posted successfully!")
        } catch (err) {
            console.error(err)
            antdMessage.error("Error sending comment")
        } finally {
            setLoading(false)
        }
    }

    const handleReplySubmit = async (commentId) => {
        const content = replyInputs[commentId]?.trim()
        if (!content) return antdMessage.warning("Reply cannot be empty")
        try {
            await axios.post(`http://localhost:5000/api/replies`, {
                parentCommentId: commentId,
                author: user.username,
                message: content,
            })
            setReplyInputs((prev) => ({ ...prev, [commentId]: "" }))
            setShowReplyForm((prev) => ({ ...prev, [commentId]: false }))
            fetchReplies(commentId)
            antdMessage.success("Reply posted successfully!")
        } catch (err) {
            console.error(err)
            antdMessage.error("Failed to reply")
        }
    }

    const handleDeleteComment = (commentId) => {
        Modal.confirm({
            title: <span className="text-white">Delete Comment</span>,
            content: (
                <div className="text-black-300">
                    Are you sure you want to delete this comment? This action cannot be undone.
                </div>
            ),
            okText: "Delete",
            cancelText: "Cancel",
            okType: "danger",
            centered: true,
            className: "custom-confirm-modal",
            onOk: async () => {
                try {
                    await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                        data: { username: user.username },
                    })
                    fetchComments()
                    antdMessage.success("Comment deleted successfully")
                } catch (err) {
                    console.error(err)
                    antdMessage.error(err?.response?.data?.message || "Failed to delete comment")
                }
            },
            className: "custom-confirm-modal", // <- dùng để gán CSS
        })
    }

const handleDeleteReply = async (replyId, commentId) => {
  Modal.confirm({
    title: "Delete Reply",
    content: "Are you sure you want to delete this reply?",
    okText: "Delete",
    cancelText: "Cancel",
    okType: "danger",
    centered: true,
    onOk: async () => {
      try {
        await axios.delete(`http://localhost:5000/api/replies/${replyId}`, {
          // Nếu backend không cần `username`, có thể bỏ phần này
          data: { username: user.username },
        });
        fetchReplies(commentId);
        antdMessage.success("Reply deleted successfully");
      } catch (err) {
        console.error(err);
        antdMessage.error("Failed to delete reply");
      }
    },
  });
};


    const toggleLike = (commentId) => {
        setLikedComments((prev) => ({
            ...prev,
            [commentId]: !prev[commentId],
        }))
    }


    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })

    const toggleReplyForm = (commentId) => {
        if (!user) {
            setIsLoginModalOpen(true)
            return
        }
        setShowReplyForm((prev) => ({ ...prev, [commentId]: !prev[commentId] }))
    }

    const averageRating =
        comments.length > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1) : 0

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header Stats */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-400">{averageRating}</div>
                            <Rate disabled value={Math.round(averageRating)} className="text-sm" />
                            <div className="text-gray-400 text-sm mt-1">Average Rating</div>
                        </div>
                        <Divider type="vertical" className="h-16 bg-gray-600" />
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-400">{comments.length}</div>
                            <div className="text-gray-400 text-sm">Reviews</div>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-2 text-gray-400">
                        <MessageOutlined className="text-xl" />
                        <span className="text-lg font-medium">Community Reviews</span>
                    </div>
                </div>
            </div>

            {/* Comment Form */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <MessageOutlined className="text-white text-lg" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Share Your Review</h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-3">Rate this movie</label>
                        <div className="flex items-center space-x-4">
                            <Rate
                                tooltips={desc}
                                onChange={setRating}
                                value={rating}
                                className="text-2xl custom-rate-white"
                                style={{ color: rating > 0 ? ratingColors[rating - 1] : undefined }}
                            />
                            {rating > 0 && (
                                <Tag color={ratingColors[rating - 1]} className="px-3 py-1 text-sm font-medium">
                                    {desc[rating - 1]}
                                </Tag>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-3">Your review</label>
                        <Input.TextArea
                            rows={4}
                            placeholder="Share your thoughts about this movie... What did you like or dislike?"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 rounded-lg"
                            style={{
                                backgroundColor: "#1f2937",
                                borderColor: "#4b5563",
                                color: "white",
                            }}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400">{message.length}/500 characters</div>
                        <Button
                            type="default"
                            size="large"
                            icon={<SendOutlined />}
                            onClick={handleSubmit}
                            loading={loading}
                            disabled={!message.trim() || rating === 0}
                            className="!bg-red-600 !text-white hover:!bg-red-700 hover:!text-white !border !border-red-600 hover:!border-red-700 px-8 py-2 h-auto font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        />


                    </div>

                    {!user && (
                        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 flex items-center space-x-3">
                            <div className="text-yellow-400 text-xl">⚠️</div>
                            <div>
                                <div className="text-yellow-400 font-medium">Login Required</div>
                                <div className="text-gray-300 text-sm">Please log in to share your review</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6 border-b border-gray-600">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                                <StarFilled className="text-white-400 text-lg" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Reviews</h3>
                        </div>
                        <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {comments.length}
                        </div>
                    </div>

                </div>

                <div className="p-8">
                    {comments.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CommentOutlined className="text-gray-400 text-3xl" />
                            </div>
                            <div className="text-gray-400 text-lg font-medium mb-2">No reviews yet</div>
                            <div className="text-gray-500 text-sm">Be the first to share your thoughts!</div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {comments.map((comment, index) => (
                                <div key={comment._id} className="group">
                                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                                        {/* Comment Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <Avatar
                                                    size={48}
                                                    icon={<UserOutlined />}
                                                    className="bg-gradient-to-r from-blue-500 to-purple-600 flex-shrink-0"
                                                />
                                                <div>
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <span className="text-white font-semibold text-lg">{comment.author}</span>
                                                        <Rate
                                                            disabled
                                                            value={comment.rating}
                                                            className="text-sm"
                                                            style={{ color: ratingColors[comment.rating - 1] }}
                                                        />
                                                        <Tag color={ratingColors[comment.rating - 1]} className="text-xs font-medium">
                                                            {desc[comment.rating - 1]}
                                                        </Tag>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-gray-400 text-sm">
                                                        <ClockCircleOutlined />
                                                        <span>{formatDate(comment.createdAt)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {user?.username === comment.author && (
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => handleDeleteComment(comment._id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                >
                                                    Delete
                                                </Button>
                                            )}
                                        </div>

                                        {/* Comment Content */}
                                        <div className="ml-16 space-y-4">
                                            <p className="text-gray-200 leading-relaxed text-base">{comment.message}</p>

                                            {/* Comment Actions */}
                                            <div className="flex items-center space-x-4 pt-2">
                                                <div className="flex items-center gap-4 mt-2">
                                                    <Button
                                                        type="text"
                                                        size="large"
                                                        onClick={() => toggleLike(comment._id)}
                                                        className="text-xl"
                                                    >
                                                        {likedComments[comment._id] ? "❤️" : "🤍"}
                                                    </Button>

                                                    <Button
                                                        type="text"
                                                        size="large"
                                                        icon={
                                                            <span className="text-xl  transition-colors duration-200">
                                                                <MessageOutlined />
                                                            </span>
                                                        }
                                                        onClick={() => toggleReplyForm(comment._id)}
                                                        className="!text-gray-400 group"
                                                    >
                                                        <span className="text-lg">Reply</span>
                                                    </Button>
                                                </div>

                                                {replies[comment._id]?.length > 0 && (
                                                    <span className="text-gray-500 text-sm">
                                                        {replies[comment._id].length} {replies[comment._id].length === 1 ? "reply" : "replies"}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Reply Form */}
                                            {showReplyForm[comment._id] && (
                                                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                                                    <Input.TextArea
                                                        rows={3}
                                                        value={replyInputs[comment._id] || ""}
                                                        placeholder="Write a thoughtful reply..."
                                                        onChange={(e) => setReplyInputs((prev) => ({ ...prev, [comment._id]: e.target.value }))}
                                                        className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 mb-3"
                                                        style={{
                                                            backgroundColor: "#1f2937",
                                                            borderColor: "#4b5563",
                                                            color: "white",
                                                        }}
                                                    />
                                                    <div className="flex justify-end space-x-2 mt-2">
                                                        <Button
                                                            size="small"
                                                            onClick={() =>
                                                                setShowReplyForm((prev) => ({ ...prev, [comment._id]: false }))
                                                            }
                                                            type="text"
                                                            className="!text-white hover:!text-white hover:!bg-transparent"
                                                        >
                                                            Cancel
                                                        </Button>

                                                        <Button
                                                            type="text"
                                                            size="small"
                                                            onClick={() => handleReplySubmit(comment._id)}
                                                            disabled={!replyInputs[comment._id]?.trim()}
                                                            className="!text-white hover:!text-white hover:!bg-transparent"
                                                        >
                                                            Reply
                                                        </Button>
                                                    </div>


                                                </div>
                                            )}

                                            {/* Replies */}
                                            {replies[comment._id]?.length > 0 && (
                                                <div className="space-y-3 pt-4 border-t border-gray-700/50">
                                                    {replies[comment._id].map((reply) => (
                                                        <div key={reply._id} className="bg-gray-700/20 rounded-lg p-4 border border-gray-600/20">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <Avatar
                                                                        size={32}
                                                                        icon={<UserOutlined />}
                                                                        className="bg-gradient-to-r from-green-500 to-teal-600"
                                                                    />
                                                                    <div>
                                                                        <span className="text-white font-medium">{reply.author}</span>
                                                                        <div className="text-gray-400 text-xs">{formatDate(reply.createdAt)}</div>
                                                                    </div>
                                                                </div>
                                                                {user?.username === reply.author && (
                                                                    <Button
                                                                        type="text"
                                                                        size="small"
                                                                        danger
                                                                        icon={<DeleteOutlined />}
                                                                        onClick={() => handleDeleteReply(reply._id, comment._id)}
                                                                        className="text-xs"
                                                                    />
                                                                )}
                                                            </div>
                                                            <p className="text-gray-200 text-sm ml-11">{reply.message}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {index < comments.length - 1 && <Divider className="border-gray-700/50 my-8" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Login Modal */}
            <Modal
                open={isLoginModalOpen}
                onCancel={() => setIsLoginModalOpen(false)}
                footer={null}
                centered
                width={480}
                className="custom-modal"
            >
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserOutlined className="text-yellow-400 text-2xl" />
                    </div>
                    <div className="text-yellow-400 text-xl font-bold mb-2">Login Required</div>
                    <div className="text-gray-300 mb-8 leading-relaxed">
                        Join our community to share your thoughts and connect with other movie enthusiasts!
                    </div>
                    <Space direction="vertical" size="middle" className="w-full">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate("/login", { state: { from: location.pathname } })}
                            className="w-full bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 h-12 font-semibold text-base"
                        >
                            Login to Continue
                        </Button>
                        <Button
                            size="large"
                            onClick={() => setIsLoginModalOpen(false)}
                            className="w-full bg-gray-700 hover:bg-gray-600 border-gray-600 text-white h-12"
                        >
                            Maybe Later
                        </Button>
                    </Space>
                </div>
            </Modal>
        </div>
    )
}

export default CommentSection
