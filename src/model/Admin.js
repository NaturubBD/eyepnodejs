const mongoose = require("mongoose"),
  bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
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
    email: {
      type: String,
      default: null,
    },
    photo: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    branch: {
      type: mongoose.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },
    role: {
      type: String,
      enum: ["superAdmin", "eyeBuddyAdmin", "hospitalAdmin","customerSupportManager"],
      default: "hospitalAdmin",
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
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Admin", schema);
