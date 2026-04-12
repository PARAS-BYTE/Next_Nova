import asyncHandler from "express-async-handler";
import Certificate from "../Models/Certificate.js";
import User from "../Models/User.js";
import blockchainService from "../utils/blockchainService.js";

// @desc    Get all certificates for a user
// @route   GET /api/certificates/my
// @access  Private
export const getMyCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id }).sort("-mintedAt");
  res.json(certificates);
});

// @desc    Get a single certificate by tokenId
// @route   GET /api/certificates/:tokenId
// @access  Public
export const getCertificateById = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findOne({ tokenId: req.params.tokenId })
    .populate("user", "username name avatarUrl")
    .populate("course", "title thumbnail level");
  
  if (!certificate) {
    res.status(404);
    throw new Error("Certificate not found");
  }

  res.json(certificate);
});

// @desc    Issue a metadata for NFT (OpenSea compatible)
// @route   GET /api/certificates/metadata/:timestamp
// @access  Public
export const getMetadata = asyncHandler(async (req, res) => {
  // This is a placeholder for dynamic metadata
  res.json({
    name: "LearnNova Course Completion Certificate",
    description: "This NFT verifies that the holder has successfully completed a course on LearnNova.",
    image: "https://learnnova.vercel.app/images/certificate-placeholder.png",
    attributes: [
      { trait_type: "Platform", value: "LearnNova" },
      { trait_type: "Technology", value: "Blockchain" }
    ]
  });
});
