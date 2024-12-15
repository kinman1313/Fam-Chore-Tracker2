"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendResetEmail = async (email, resetToken) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const message = {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: email,
        subject: 'Password Reset Token',
        text: `You are receiving this email because you (or someone else) has requested the reset of a password. 
    Please click on the following link to reset your password: \n\n ${resetUrl}`
    };
    await transporter.sendMail(message);
};
exports.sendResetEmail = sendResetEmail;
//# sourceMappingURL=email.js.map