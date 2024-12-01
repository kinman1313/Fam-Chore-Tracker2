const findByUsername = async (username) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT * FROM users WHERE username = ?',
            [username],
            async (err, user) => {
                if (err) {
                    console.error('Database error:', err);
                    reject(err);
                    return;
                }
                if (user) {
                    console.log('Found user:', {
                        id: user.id,
                        username: user.username,
                        role: user.role,
                        hasPassword: !!user.password
                    });
                }
                resolve(user);
            }
        );
    });
};
