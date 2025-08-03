const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    location: {
      type: {
        type: String,
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    description: {
      type: String,
      default: null,
    },
    // banner: {
    //   type: String,
    //   default: null,
    // },
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

schema.index({ location: "2dsphere" });
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Hospital", schema);
