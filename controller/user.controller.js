import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is missing or invalid!",
      });
    }
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token!",
      });
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(201).json({
      success: true,
      message: "User has been verified successfully!",
    });
  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong during verification.",
      error: error.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields (email, and password) are required.",
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong during login.",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found!",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile. Please try again.",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      expires: new Date(0),
    });

    res.status(200).json({
      message: "Logout successful!",
      success: true,
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      message: "Failed to log out. Please try again.",
      success: false,
    });
  }
};

export { registerUser, verifyUser, loginUser, getMe };
