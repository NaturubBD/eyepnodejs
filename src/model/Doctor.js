const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const userSchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    dialCode: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    signature: {
      type: String,
      default: null,
    },
    specialty: {
      type: mongoose.Types.ObjectId,
      ref: "Specialty",
    },
    hospital: {
      type: mongoose.Types.ObjectId,
      ref: "Hospital",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "none"],
      default: "none",
    },
    experienceInYear: {
      type: Number,
      default: 0,
    },
    bmdcCode: {
      type: String,
      default: null,
    },
    consultationFee: {
      type: Number,
      default: 0,
    },
    followupFee: {
      type: Number,
      default: 0,
    },
    about: {
      type: String,
      default: null,
    },
    deviceTokens: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "waitingForApproval",
        "activated",
        "disabled",
      ],
      default: "waitingForApproval",
    },
    availabilityStatus: {
      type: String,
      enum: ["offline", "online"],
      default: "offline",
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    averageConsultancyTime: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number,
      default: 0,
    },
    totalConsultationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Doctor", userSchema);
