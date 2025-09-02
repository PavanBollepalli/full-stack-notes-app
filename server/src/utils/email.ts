import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your-mailtrap-user',
    pass: process.env.EMAIL_PASS || 'your-mailtrap-password',
  },
});

export const sendOTP = async (email: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Notes App',
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};
