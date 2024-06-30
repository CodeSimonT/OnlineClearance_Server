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

// Function to send a change email link
const emailSender = async (url, receiverEmail) => {
    try {
        const mailOptions = {
            from: 'AMACC-NAGA OSC',
            to: receiverEmail,
            subject: 'Change Email Request',
            html: `
                <h1>Change Email Request</h1>
                <p>Please click the link below to change your email address:</p>
                <p><a href="${url}" style="padding:10px 20px;background-color:#7D0A0A; border-radius:5px;color:white;text-decoration:none;">Change Email</a></p>
                <p>This link is used to change your email address and ensure the security of your account. Do not share it with anyone.</p>
                <p>If the button above does not work, please copy and paste the following URL into your web browser:</p>
                <p><a href="${url}">${url}</a></p>
                <p>This link is used to change your email address and ensure the security of your account. Do not share it with anyone.</p>
                <p><strong>Important:</strong> Please keep this link confidential and do not share it with others. We will never ask you to share your link.</p>
                <p>If you did not request this email change, please ignore this email.</p>
                <p>Best regards,<br/><strong>AMACC-NAGA OSC</strong></p>
            `,
        };

        await transporter.sendMail(mailOptions);
        return 'success';
    } catch (error) {
        return error;
    }
}

module.exports = emailSender;