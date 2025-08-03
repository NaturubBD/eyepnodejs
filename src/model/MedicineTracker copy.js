const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    patient: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    time: {
      type: [String],
      default: [],
    },
    sat: {
      type: Boolean,
      default: false,
    },
    sun: {
      type: Boolean,
      default: false,
    },
    mon: {
      type: Boolean,
      default: false,
    },
    tue: {
      type: Boolean,
      default: false,
    },
    wed: {
      type: Boolean,
      default: false,
    },
    thu: {
      type: Boolean,
      default: false,
    },
    fri: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("MedicineTracker", schema);
