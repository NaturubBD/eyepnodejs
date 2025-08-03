const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const moment = require("moment");
const schema = new Schema(
  {
    locationGenre: {
      type: String,
      enum: ["local", "foreigner"],
      default: "local",
    },
    appointmentType: {
      type: String,
      enum: ["regular", "followUp"],
      default: "regular",
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    weight: {
      type: Number,
      default: 0,
    },
    age: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paymentId: {
      type: String,
      default: null,
    },
    paymentMethod: {
      type: String,
      default: null,
    },
    notifiedForFollowUp: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      // required: true,
      default: moment.utc().toDate(),
    },
    eyePhotos: [
      {
        type: String,
        trim: true,
        required: false,
        default: [],
      },
    ],
    additionalFiles: {
      type: [String],
      trim: true,
      default: [],
    },
    promoCode: {
      type: String,
      default: null,
    },
    callDurationInSec: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    usdTotalAmount: {
      type: Number,
      default: 0,
    },
    fee: {
      type: Number,
      default: 0,
    },
    usdFee: {
      type: Number,
      default: 0,
    },
    vat: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    usdVat: {
      type: Number,
      default: 0,
    },
    usdDiscount: {
      type: Number,
      default: 0,
    },
    grandTotal: {
      type: Number,
      default: 0,
    },
    usdGrandTotal: {
      type: Number,
      default: 0,
    },
    isPrescribed: {
      type: Boolean,
      default: false,
    },
    notifiedForRating: {
      type: Boolean,
      default: false,
    },
    hasRating: {
      type: Boolean,
      default: false,
    },
    doctorAgoraToken: {
      type: String,
      default: null,
    },
    patientAgoraToken: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: [
        "waitingForPayment",
        "queued",
        "dropped",
        "late",
        "completed",
        "refunded",
      ],
      default: "waitingForPayment",
    },

    paymentData: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);
schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Appointment", schema);
