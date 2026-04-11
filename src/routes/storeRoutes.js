import express from "express";
import { getRedemptions, getStoreItems, redeemItem } from "../controllers/StoreController.js";
// import { getStoreItems, redeemItem } from "../controllers/storeController.js";

const router = express.Router();

router.get("/", getStoreItems);
router.post("/redeem", redeemItem);
router.get("/redemptions", getRedemptions);
router.get("/tracking/:redemptionId",getStoreItems);

export default router;
