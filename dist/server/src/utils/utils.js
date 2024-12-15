"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASSWORD || '',
    },
});
const sendEmail = async (options) => {
    const message = {
        from: process.env.EMAIL_FROM || 'noreply@choretracker.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
    };
    await transporter.sendMail(message);
};
exports.sendEmail = sendEmail;
const sendResetEmail = async (email, resetUrl) => {
    const message = {
        to: email,
        subject: 'Password Reset Request',
        html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #3B82F6;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 10 minutes.</p>
      <hr>
      <p style="color: #666; font-size: 12px;">
        If the button doesn't work, copy and paste this link into your browser:
        <br>
        ${resetUrl}
      </p>
    `,
    };
    await (0, exports.sendEmail)(message);
};
exports.sendResetEmail = sendResetEmail;
//# sourceMappingURL=utils.js.map