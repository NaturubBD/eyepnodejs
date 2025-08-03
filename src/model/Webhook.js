const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    data: {
      type: Object,
      default: {},
    },
    type: {
      type: String,
      enum: ["bkash", "sslcommerzIpnWebhook"],
      default: "bkash",
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Webhook", schema);
