import express from "express";
import { getMe, loginUser, registerUser, verifyUser } from "../controller/user.controller.js";
import isLoggedIn from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.get('/verify/:token',verifyUser);
router.post('/login',loginUser);
router.get('/me',isLoggedIn,getMe);

export default router;
