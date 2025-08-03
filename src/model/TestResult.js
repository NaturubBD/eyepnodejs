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
    attachment: {
      type: String,
      default: null,
    },
    data: {
      type: Object,
      default: {},
    },
    type: {
      type: String,
      enum: ["app", "clinical"],
      default: "app",
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
module.exports = mongoose.model("TestResult", schema);
