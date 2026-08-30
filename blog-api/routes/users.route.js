import express from "express";
import { verify_token, is_admin } from "../middlewares/auth.middleware.js";
import {
  get_users,
  get_user_by_id,
  get_own_profile,
  update_own_profile,
  update_own_password,
  update_status,
} from "../controller/users.controller.js";

const router = express.Router();

// ⚠️ /profile must come before /:id — otherwise Express treats "profile" as an id
router.get("/profile",         verify_token,           get_own_profile);
router.put("/profile/update",  verify_token,           update_own_profile);
router.patch("/password",      verify_token,           update_own_password);

router.get("/",                verify_token, is_admin, get_users);
router.get("/:id",             verify_token, is_admin, get_user_by_id);
router.patch("/:id/status",    verify_token, is_admin, update_status);

export default router;
