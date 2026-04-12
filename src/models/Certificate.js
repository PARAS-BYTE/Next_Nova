import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentName: String,
    courseTitle: String,
    tokenId: Number,
    transactionHash: String,
    mintedAt: {
      type: Date,
      default: Date.now,
    },
    blockchainUrl: String, // Explorer link
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
