import express from "express";
import { sign_up, log_in } from "../controller/auth.controller.js";

const router = express.Router();

router.post("/register", sign_up);  // public
router.post("/login",    log_in);   // public

export default router;
