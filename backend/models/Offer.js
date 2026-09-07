const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    collector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    offerPrice: { type: Number, required: true, min: 0 },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "countered", "expired", "withdrawn"],
      default: "pending",
    },
    counterOffers: [
      {
        offeredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        price: { type: Number, required: true, min: 0 },
        message: { type: String, default: "" },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

offerSchema.index({ listing: 1, collector: 1 });
offerSchema.index({ status: 1 });

module.exports = mongoose.model("Offer", offerSchema);