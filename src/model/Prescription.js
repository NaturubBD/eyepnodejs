const mongoose = require("mongoose");
const { Schema } = mongoose;

var aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const schema = new Schema(
  {
    title: {
      type: String,
      default: null,
    },
    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    // medicines: [
    //   {
    //     name: {
    //       type: String,
    //       required: true,
    //     },
    //     dosage: {
    //       type: String,
    //       required: true,
    //     },
    //   },
    // ],

    medicines: {
      type: Array,
      default: [],
    },
    diagnosis: {
      type: Array,
      default: [],
    },

    investigations: {
      type: Array,
      default: [],
    },

    surgery: {
      type: Array,
      default: [],
    },
    complaints: {
      type: Array,
      default: [],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    referredTo: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      required: false,
      default: null,
    },
    file: {
      type: String,
      required: false,
      default: null,
    },
    type: {
      type: String,
      enum: ["generated", "uploaded"],
      default: "generated",
    },
  },
  { timestamps: true }
);

schema.plugin(aggregatePaginate);
module.exports = mongoose.model("Prescription", schema);
