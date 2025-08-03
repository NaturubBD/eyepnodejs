const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    support: {
      type: mongoose.Types.ObjectId,
      ref: "Support",
    },
    senderType: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    contentType: {
      type: String,
      enum: ["text", "attachment"],
      default: "text",
    },
    content: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("SupportMessage", schema);
