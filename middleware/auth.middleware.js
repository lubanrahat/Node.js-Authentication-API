import jwt from "jsonwebtoken";
import User from "../model/User.model.js";

const isLoggedIn = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No token provided",
        });
      }
      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESHTOKEN_SECRET
      );
      const user = await User.findOne({ _id: refreshDecoded.id });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No token provided",
        });
      }
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESSTOKEN_SECRET,
        {
          expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
        }
      );
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESHTOKEN_SECRET,
        {
          expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
        }
      );
      user.refreshToken = newRefreshToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie("accessToken", newAccessToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, cookieOptions);
      req.user = refreshDecoded;
      next();
    } else {
      const accessDecoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESSTOKEN_SECRET
      );
      const user = await User.findOne({ _id: accessDecoded.id });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized: No token provided",
        });
      }
      const newAccessToken = jwt.sign(
        { id: user._id },
        process.env.JWT_ACCESSTOKEN_SECRET,
        {
          expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
        }
      );
      const newRefreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESHTOKEN_SECRET,
        {
          expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRY,
        }
      );
      user.refreshToken = newRefreshToken;
      await user.save();

      const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000,
      };

      res.cookie("accessToken", newAccessToken, cookieOptions);
      res.cookie("refreshToken", newRefreshToken, cookieOptions);
      req.user = accessDecoded;
      next();
    }
  } catch (error) {
    console.error("Auth middleware failure:", error.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

export default isLoggedIn;
