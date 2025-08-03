const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const userSchema = new Schema(
  {
    eyeHospitalPID: {
      type: String,
      default: null,
    },
    patientType: {
      type: String,
      enum: ["main", "relative"],
      default: "main",
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    relation: {
      type: String,
      default: "none",
    },
    name: {
      type: String,
      default: null,
    },
    dialCode: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    weight: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "none"],
      default: "none",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    favoriteDoctors: [
      {
        type: Schema.Types.ObjectId,
        ref: "Doctor",
        default: [],
      },
    ],
    totalConsultationCount: {
      type: Number,
      default: 0,
    },
    deviceTokens: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "activated", "disabled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
userSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Patient", userSchema);
