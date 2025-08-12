const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
const userSchema = new Schema(
  {
    traceId: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Types.ObjectId,
      default: null,
    },
    criteria: {
      type: String,
      enum: [
        "patient_auth",
        "admin_auth",
        "doctor_auth",
        "patient_phone_change",
        "doctor_phone_change",
      ],
      default: "patient_auth",
    },
    phoneWithDialCode: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    via: {
      type: String,
      enum: ["phone"],
      default: "phone",
    },
    code: {
      type: String,
      default: null,
    },
    data: {
      type: Object,
      default: {},
    },
    expireAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
const OtpVerification = mongoose.model("OtpVerification", userSchema);
module.exports = OtpVerification;



