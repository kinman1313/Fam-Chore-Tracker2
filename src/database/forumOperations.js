const db = require('./init')();

const forumOperations = {
    // Post Operations
    posts: {
        async create({ userId, content, mediaUrl, mediaType }) {
            return new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO posts (user_id, content, media_url, media_type, created_at, updated_at)
                    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;
                db.run(sql, [userId, content, mediaUrl, mediaType], function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                });
            });
        },

        async getAll(page = 1, limit = 10) {
            return new Promise((resolve, reject) => {
                const offset = (page - 1) * limit;
                const sql = `
                    SELECT 
                        p.*,
                        u.username,
                        u.avatar as userAvatar,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
                        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY p.is_pinned DESC, p.created_at DESC
                    LIMIT ? OFFSET ?
                `;
                db.all(sql, [limit, offset], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        },

        async getById(postId) {
            return new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        p.*,
                        u.username,
                        u.avatar as userAvatar,
                        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count,
                        (SELECT COUNT(*) FROM reactions WHERE post_id = p.id) as reaction_count
                    FROM posts p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.id = ?
                `;
                db.get(sql, [postId], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });
        },

        async update({ postId, content, mediaUrl, mediaType }) {
            return new Promise((resolve, reject) => {
                const sql = `
                    UPDATE posts 
                    SET content = ?, 
                        media_url = ?, 
                        media_type = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                db.run(sql, [content, mediaUrl, mediaType, postId], function(err) {
                    if (err) reject(err);
                    resolve(this.changes > 0);
                });
            });
        },

        async delete(postId) {
            return new Promise((resolve, reject) => {
                db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
                    if (err) reject(err);
                    resolve(this.changes > 0);
                });
            });
        },

        async togglePin(postId) {
            return new Promise((resolve, reject) => {
                db.run(
                    'UPDATE posts SET is_pinned = NOT is_pinned WHERE id = ?',
                    [postId],
                    function(err) {
                        if (err) reject(err);
                        resolve(this.changes > 0);
                    }
                );
            });
        }
    },

    // Comment Operations
    comments: {
        async create({ postId, userId, content, mediaUrl, mediaType, parentCommentId = null }) {
            return new Promise((resolve, reject) => {
                const sql = `
                    INSERT INTO comments (
                        post_id, user_id, content, media_url, media_type, 
                        parent_comment_id, created_at, updated_at
                    )
                    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;
                db.run(sql, 
                    [postId, userId, content, mediaUrl, mediaType, parentCommentId],
                    function(err) {
                        if (err) reject(err);
                        resolve(this.lastID);
                    }
                );
            });
        },

        async getForPost(postId) {
            return new Promise((resolve, reject) => {
                const sql = `
                    SELECT 
                        c.*,
                        u.username,
                        u.avatar as userAvatar,
                        (SELECT COUNT(*) FROM reactions WHERE comment_id = c.id) as reaction_count
                    FROM comments c
                    JOIN users u ON c.user_id = u.id
                    WHERE c.post_id = ?
                    ORDER BY 
                        CASE WHEN c.parent_comment_id IS NULL THEN c.id ELSE c.parent_comment_id END,
                        c.created_at ASC
                `;
                db.all(sql, [postId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        },

        async update({ commentId, content, mediaUrl, mediaType }) {
            return new Promise((resolve, reject) => {
                const sql = `
                    UPDATE comments 
                    SET content = ?, 
                        media_url = ?, 
                        media_type = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                db.run(sql, [content, mediaUrl, mediaType, commentId], function(err) {
                    if (err) reject(err);
                    resolve(this.changes > 0);
                });
            });
        },

        async delete(commentId) {
            return new Promise((resolve, reject) => {
                db.run('DELETE FROM comments WHERE id = ?', [commentId], function(err) {
                    if (err) reject(err);
                    resolve(this.changes > 0);
                });
            });
        }
    },

    // Reaction Operations
    reactions: {
        async toggle({ userId, postId, commentId = null, reactionType }) {
            return new Promise((resolve, reject) => {
                db.serialize(() => {
                    db.get(
                        `SELECT id FROM reactions 
                         WHERE user_id = ? AND post_id = ? AND comment_id = ? AND reaction_type = ?`,
                        [userId, postId, commentId, reactionType],
                        (err, row) => {
                            if (err) return reject(err);

                            if (row) {
                                // Remove existing reaction
                                db.run(
                                    'DELETE FROM reactions WHERE id = ?',
                                    [row.id],
                                    function(err) {
                                        if (err) return reject(err);
                                        resolve({ added: false, removed: true });
                                    }
                                );
                            } else {
                                // Add new reaction
                                db.run(
                                    `INSERT INTO reactions (user_id, post_id, comment_id, reaction_type)
                                     VALUES (?, ?, ?, ?)`,
                                    [userId, postId, commentId, reactionType],
                                    function(err) {
                                        if (err) return reject(err);
                                        resolve({ added: true, removed: false });
                                    }
                                );
                            }
                        }
                    );
                });
            });
        },

        async getForPost(postId) {
            return new Promise((resolve, reject) => {
                const sql = `
                    SELECT r.*, u.username
                    FROM reactions r
                    JOIN users u ON r.user_id = u.id
                    WHERE r.post_id = ?
                `;
                db.all(sql, [postId], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });
        }
    }
};

module.exports = forumOperations;
