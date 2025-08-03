const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    title: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      default: null,
    },
    banner: {
      type: String,
      default: null,
    },
    audience: {
      type: String,
      enum: ["all", "patient", "doctor"],
      default: "patient",
    },
    audienceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    criteria: {
      type: String,
      enum: [
        "appointment",
        "appointmentRating",
        "followUpAppointment",
        "prescription",
        "withdraw",
        "any",
      ],
      default: "any",
    },
    notifiableId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: ["basic", "standard", "system"],
      default: "system",
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    metaData: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["sent", "scheduled"],
      default: "scheduled",
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Notification", schema);
