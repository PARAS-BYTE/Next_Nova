import express from "express";
import { getMyCertificates, getCertificateById, getMetadata } from "../controllers/CertificateController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my", protect, getMyCertificates);
router.get("/metadata/:timestamp", getMetadata);
router.get("/:tokenId", getCertificateById);

export default router;
