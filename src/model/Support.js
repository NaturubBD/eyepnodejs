const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    admin: {
      type: mongoose.Types.ObjectId,
      ref: "Admin",
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
    },
    subject: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolveNote: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "inProgress", "resolved"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Support", schema);
