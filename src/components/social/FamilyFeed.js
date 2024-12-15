import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FamilyFeed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'achievement',
      user: {
        name: 'Sarah',
        avatar: '👧'
      },
      achievement: {
        title: 'Early Bird',
        description: 'Completed 5 chores before 9 AM',
        icon: '🌅',
        points: 100
      },
      message: "I'm getting better at waking up early!",
      likes: 3,
      comments: [
        { id: 1, user: 'Mom', avatar: '👩', text: 'Great job, sweetie!' },
        { id: 2, user: 'Dad', avatar: '👨', text: 'Keep it up! 👍' }
      ],
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
    // Add more posts...
  ]);

  const [showCommentInput, setShowCommentInput] = useState(null);
  const [newComment, setNewComment] = useState('');

  const handleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const handleComment = (postId) => {
    if (newComment.trim()) {
      setPosts(posts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [...post.comments, {
                id: Date.now(),
                user: 'You',
                avatar: '👤',
                text: newComment
              }]
            }
          : post
      ));
      setNewComment('');
      setShowCommentInput(null);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now - date) / 1000; // difference in seconds

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            className="bg-[rgba(26,26,26,0.75)] backdrop-blur-lg border border-[rgba(255,255,255,0.1)] rounded-xl p-6"
          >
            {/* Post Header */}
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl">{post.user.avatar}</span>
              <div>
                <h3 className="text-white font-medium">{post.user.name}</h3>
                <p className="text-sm text-gray-400">{formatTime(post.timestamp)}</p>
              </div>
            </div>

            {/* Achievement Card */}
            <div className="bg-[rgba(0,255,159,0.1)] rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{post.achievement.icon}</span>
                <div>
                  <h4 className="text-white font-medium">{post.achievement.title}</h4>
                  <p className="text-sm text-gray-400">{post.achievement.description}</p>
                  <p className="text-[#00ff9f] text-sm mt-1">+{post.achievement.points} points</p>
                </div>
              </div>
            </div>

            {/* Message */}
            {post.message && (
              <p className="text-white mb-4">{post.message}</p>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-4 mb-4">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-[#00ff9f] transition-colors"
              >
                <span>👍</span>
                <span>{post.likes}</span>
              </button>
              <button
                onClick={() => setShowCommentInput(post.id)}
                className="flex items-center space-x-2 text-gray-400 hover:text-[#00ff9f] transition-colors"
              >
                <span>💬</span>
                <span>{post.comments.length}</span>
              </button>
            </div>

            {/* Comments */}
            <div className="space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <span className="text-xl">{comment.avatar}</span>
                  <div className="flex-1 bg-[rgba(255,255,255,0.05)] rounded-lg p-3">
                    <p className="text-white text-sm font-medium">{comment.user}</p>
                    <p className="text-gray-400 text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}

              {/* Comment Input */}
              <AnimatePresence>
                {showCommentInput === post.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center space-x-3"
                  >
                    <span className="text-xl">👤</span>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full px-4 py-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:ring-2 focus:ring-[#00ff9f] focus:border-transparent transition-all"
                        onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FamilyFeed; 