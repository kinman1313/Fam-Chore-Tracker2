const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendResetEmail = async (email, resetToken) => {
    const resetUrl = `${process.env.APP_URL}/auth/reset-password/${resetToken}`;
    
    const mailOptions = {
        from: `"FamChore" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
            <div style="background-color: #1e293b; color: #f8fafc; padding: 20px; border-radius: 8px;">
                <h1 style="color: #3b82f6;">Reset Your Password</h1>
                <p>You requested a password reset. Click the button below to create a new password:</p>
                <a href="${resetUrl}" 
                   style="display: inline-block; background-color: #3b82f6; color: white; 
                          padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                          margin: 20px 0;">
                    Reset Password
                </a>
                <p style="color: #94a3b8; margin-top: 20px;">
                    If you didn't request this, you can safely ignore this email.
                    The link will expire in 1 hour.
                </p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendResetEmail };
