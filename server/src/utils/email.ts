import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"Notes App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP for Notes App - Secure Login',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to Notes App</h2>
        <p style="font-size: 16px; color: #666;">Your One-Time Password (OTP) for secure login is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; background-color: #f8f9fa; padding: 15px 30px; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666;">
          This OTP will expire in <strong>10 minutes</strong>.<br>
          Please do not share this code with anyone.
        </p>
        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
          If you didn't request this OTP, please ignore this email.
        </p>
      </div>
    `,
    text: `Your OTP for Notes App is: ${otp}. It expires in 10 minutes. Please do not share this code with anyone.`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', email);
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
