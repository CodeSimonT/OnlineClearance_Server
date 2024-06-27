const nodemailer = require('nodemailer');
require('dotenv').config();
const user = process.env.USER;
const pass = process.env.PASSWORD;
// Create a transporter using your email service (e.g., Gmail)
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: `${user}`,
        pass: `${pass}`,
    },
});

// Function to send a verification email
const emailSender = async(receiverEmail, verificationCode, type) => {
    try {
        const mailOptions = await transporter.sendMail(
            {
                from: 'AMACC-NAGA OSC',
                to: receiverEmail,
                subject: 'Verification code',
                html: `
                <h1>${type === 'reset' ? 'Reset password':'Verification Code'}</h1>
                <p>Please use the ${type === 'reset' ? 'verification':''} code below to ${type === 'reset' ? "reset your password":"verify your email address"}</p>
                <p><strong>${type ==='reset' ? '':'Verification '} Code:</strong> <span style="padding:5px 10px;background-color:#7D0A0A; border-radius:5px;color:white;">${verificationCode}</span></p>
                <p>This code is used to ${type === 'reset' ? 'reset your password':'verify your email'} and ensure the security of your account. Do not share it with anyone.</p>
                <p><strong>Important:</strong> Please keep this code confidential and do not share it with others. We will never ask you to share your OTP.</p>
                <p>If you did not request this verification, please ignore this email.</p>
                <p>Best regards,<br/><strong>AMACC-NAGA OSC</strong></p>
                `,
            }
        );
        
        return 'success'
    } catch (error) {
        return error
    }
}

module.exports = emailSender;