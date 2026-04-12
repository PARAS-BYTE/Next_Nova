import express from "express";
import {
  getNotifications,
  markNotificationsRead,
  pushNotification,
  generateSmartNotifications,
  deleteNotification,
} from "../controllers/NotificationController.js";

const router = express.Router();

router.get("/", getNotifications);
router.put("/read", markNotificationsRead);
router.post("/push", pushNotification);
router.post("/generate", generateSmartNotifications);
router.delete("/:id", deleteNotification);

export default router;
