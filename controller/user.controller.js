import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, email, and password) are required.",
    });
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: true,
      message: "Invalid email address.",
    });
  }
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (passwordRegex.test(passwordRegex)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.",
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
        message: "Invalid email or password!",
      });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password!",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_ACCESSTOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
      }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESHTOKEN_SECRET,
      {
        expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
      }
    );
    user.refreshToken = refreshToken;
    await user.save();

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful!",
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
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized access",
    });
  }
  try {
    const refreshDecoded = jwt.verify(
      token,
      process.env.JWT_REFRESHTOKEN_SECRET
    );
    const user = await User.findOne({ _id: refreshDecoded.id });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }
    user.refreshToken = null;
    await user.save();
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000,
    };

    res.cookie("accessToken", "", cookieOptions);
    res.cookie("refreshToken", "", cookieOptions);

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      message: "Failed to log out. Please try again.",
      success: false,
    });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "Email is required!",
      success: false,
    });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "This email is not registered!",
      });
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = new Date(Date.now() + 10 * 60 * 1000);
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
      subject: "Reset Your Password",
      text: `You requested a password reset.\nClick the link below to reset your password:\n${process.env.BASE_URL}/api/v1/users/reset-password/${user.resetPasswordToken}`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent successfully!",
    });
  } catch (error) {
    console.error("Forget Password Error:", error.message);
    res.status(500).json({
      message: "Something went wrong while processing the password reset.",
      success: false,
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  if (!password) {
    return res.status(400).json({
      message: "Password and confirm password are required.",
      success: false,
    });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match.",
    });
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });
    console.log(user.resetPasswordToken);
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token!",
        success: false,
      });
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.save();
    res.status(200).json({
      message: "Password reset successful!",
      success: true,
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    res.status(500).json({
      message: "Server error during password reset.",
      success: false,
    });
  }
};

export {
  registerUser,
  verifyUser,
  loginUser,
  getMe,
  logout,
  forgetPassword,
  resetPassword,
};
