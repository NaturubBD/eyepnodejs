const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const schema = new Schema(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    hospitalName: {
      type: String,
      default: null,
    },
    designation: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    currentlyWorkingHere: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("Experience", schema);
