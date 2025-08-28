import nodemailer from 'nodemailer';

// Email configuration constants
const EMAIL_CONFIG = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
};

/**
 * Creates and configures the email transporter
 * @returns {nodemailer.Transporter} Configured nodemailer transporter
 */
const createTransporter = () => {
    // Validate email credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email credentials are not configured');
    }

    return nodemailer.createTransport({
        ...EMAIL_CONFIG,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Sends an email using the configured transporter
 * @param {string} email - Recipient's email address
 * @param {string} subject - Email subject
 * @param {string} message - Email body content
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails
 */
export const sendEmail = async (email, subject, message) => {
    try {
        // Validate input parameters
        if (!email || !subject || !message) {
            throw new Error('Email, subject, and message are required');
        }

        const transporter = createTransporter();

        // Send email
        const info = await transporter.sendMail({
            from: `"Sawari.pk - Your Travel Partner" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: message,
            // Add HTML version for better email client compatibility
            html: message.replace(/\n/g, '<br>'),
        });

        console.log('Email sent successfully:', info.messageId);
        return true;
    } catch (error) {
        console.error('Email Service Error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

export default sendEmail;
