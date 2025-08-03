const mongoose = require("mongoose");
const { Schema } = mongoose;

var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

schema.plugin(aggregatePaginate);
module.exports = mongoose.model("AppointmentReason", schema);
