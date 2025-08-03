const mongoose = require("mongoose");

var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ["doctor", "patient"],
      default: "doctor",
    },
    accountType: {
      type: String,
      enum: ["bank", "mfs"],
      default: "bank",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    branch: {
      type: String,
      default: null,
    },
    district: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "District",
      default: null,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

schema.plugin(aggregatePaginate);
module.exports = mongoose.model("PaymentAccounts", schema);
