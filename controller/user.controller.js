import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, and password) are required.",
    });
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists!",
      });
    }
    const user = await User.create({
      name,
      email,
      password,
    });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This email is not registered!",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.verificationToken = token;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
      to: user.email,
      subject: "Verify Your Email ✔",
      text: `Please verify your email: ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    console.error("Registration Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong during registration.",
      error: error.message,
    });
  }
};

export { registerUser };
