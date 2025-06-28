import express from "express";
import { forgetPassword, getMe, loginUser, logout, registerUser, resetPassword, verifyUser } from "../controller/user.controller.js";
import isLoggedIn from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.get('/verify/:token',verifyUser);
router.post('/login',loginUser);
router.get('/me',isLoggedIn,getMe);
router.get('/logout',isLoggedIn,logout);
router.post('/forgetp-assword',isLoggedIn,forgetPassword);
router.post('/reset-password/:token',isLoggedIn,resetPassword);

export default router;
