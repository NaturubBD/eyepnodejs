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
      type: String,
      default: null,
    },
    day: {
      type: String,
      default: "sat",
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
