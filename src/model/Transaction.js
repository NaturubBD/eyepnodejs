const mongoose = require("mongoose");

var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new mongoose.Schema(
  {
    ownerType: {
      type: String,
      enum: ["doctor", "patient", "eyeBuddy", "hospitalAdmin"],
      default: "doctor",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    transactionType: {
      type: String,
      enum: ["debit", "credit"],
      default: "credit",
    },
    criteria: {
      type: String,
      enum: ["deposit", "withdraw"],
      default: "deposit",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentAccount",
      default: null,
    },
    amount: {
      type: Number,
      default: 0,
    },
    note: {
      type: String,
      default: null,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "declined"],
      default: "pending",
    },
    transferredBy: {
      type: String,
      enum: ["bank", "cash", "cheque", "none"],
      default: "none",
    },
  },
  { timestamps: true }
);

schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Transaction", schema);
