const { Types } = require("mongoose");
const Appointment = require("../model/Appointment");
const Doctor = require("../model/Doctor");
const AppointmentListInterface = require("../utils/AppointmentListInterface");
const dateQueryGenerator = require("../utils/dateQueryGenerator");
const { transactionCreate } = require("./TransactionService");
const { uploadFileToS3 } = require("../config/FileUpload");
const Patient = require("../model/Patient");
const moment = require("moment");
const AppointmentCompleted = require("../events/AppointmentCompleted");
const { initializeCallSession } = require("./AgoraService");
const {
  foreignerConsultationFeeInUsd,
  foreignerFollowUpFeeInUsd,
} = require("../utils/constant");
const CurrencyConverter = require("../utils/CurrencyConverter");
const AppError = require("../exception/AppError");
exports.calculateQueueStatus = async (doctor) => {
  let doctorQueueCount = await Appointment.countDocuments({
    doctor: doctor,
    status: "queued",
  });

  let waitingTimeInMin = 5;
  if (doctorQueueCount > 0) {
    waitingTimeInMin = doctorQueueCount * 7;
  }
  return {
    totalQueueCount: doctorQueueCount,
    waitingTimeInMin: waitingTimeInMin,
  };
};

exports.MarkAppointmentAsPaid = async (
  appointment,
  paymentId,
  paymentMethod = "BKash",
  paymentData={}
) => {
  appointment = await Appointment.findByIdAndUpdate(
    appointment._id,
    {
      paymentId,
      paymentMethod,
      status: "queued",
      isPaid: true,
      date: moment.utc().toDate(),
      paymentData,
    },
    { new: true }
  );

  let totalConsultationCount = await Appointment.countDocuments({
    doctor: appointment.doctor,
  });

  await Doctor.findByIdAndUpdate(appointment.doctor, {
    totalConsultationCount,
  });

  // Patient info update
  totalConsultationCount = await Appointment.countDocuments({
    patient: appointment.patient,
  });

  await Patient.findByIdAndUpdate(appointment.doctor, {
    totalConsultationCount,
  });

  await initializeCallSession(appointment);

  return appointment;
};

exports.completeAppointment = async (appointmentId, callDurationInSec = 0) => {
  let appointment = await Appointment.findById(appointmentId)
    .populate("doctor")
    .populate("patient")
    .lean();
  await Appointment.findByIdAndUpdate(
    appointment._id,
    {
      status: "completed",
    },
    { new: true }
  );

  // Create Distribute amount
  let doctorDistributionPercentage = 75;
  let eyeBuddyDistributionPercentage = 15;
  let hospitalDistributionPercentage = 10;
  let doctorPayable =
    appointment.grandTotal * (doctorDistributionPercentage / 100);

  let eyeBuddyPayable =
    appointment.grandTotal * (eyeBuddyDistributionPercentage / 100);

  let hospitalPayable =
    appointment.grandTotal * (hospitalDistributionPercentage / 100);

  await transactionCreate("doctor", appointment.doctor, {
    amount: doctorPayable,
    criteria: "deposit",
    note: `Received amount from ${appointment?.patient?.name || ""}`,
    status: "confirmed",
  });
  await transactionCreate("hospitalAdmin", null, {
    amount: hospitalPayable,
    criteria: "deposit",
    note: `Received amount from ${appointment?.patient?.name || ""}`,
    status: "confirmed",
  });
  await transactionCreate("eyeBuddy", null, {
    amount: eyeBuddyPayable,
    criteria: "deposit",
    note: `Received amount from ${appointment?.patient?.name || ""}`,
    status: "confirmed",
  });

  AppointmentCompleted(appointment._id);
  return appointment;
};

exports.initAppointment = async (
  patient,
  doctor,
  data = {},
  locationGenre = "local"
) => {
  let {
    age,
    weight,
    reason,
    description,
    eyePhotos,
    appointmentType,
    prescriptions,
  } = data;

  let eyePhotoLinks = [];
  for (const eyePhoto of eyePhotos) {
    const { base64String, fileExtension } = eyePhoto;
    if (!base64String || !fileExtension) {
      continue;
    }
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "admin/profile"
    );
    if (uploadInfo?.Key) {
      eyePhotoLinks.push(uploadInfo.Key);
    }
  }

  // Prescription upload
  prescriptions = prescriptions ?? [];
  let prescriptionLinks = [];
  for (const prescription of prescriptions) {
    let { base64String, fileExtension } = prescription;
    if (!base64String || !fileExtension) {
      continue;
    }
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "patient/prescription"
    );
    if (uploadInfo?.Key) {
      prescriptionLinks.push(uploadInfo.Key);
    }
  }

  let usdTotalAmount = 0;
  let usdGrandTotal = 0;
  let usdVat = 0;
  let usdDiscount = 0;

  let totalAmount = doctor.consultationFee;
  if (appointmentType == "followUp") {
    totalAmount = parseFloat(doctor?.followupFee ?? 0);
  }

  if (locationGenre == "foreigner") {
    usdTotalAmount = foreignerConsultationFeeInUsd;
    if (appointmentType == "followUp") {
      usdTotalAmount = foreignerFollowUpFeeInUsd;
    }
    totalAmount = CurrencyConverter(usdTotalAmount, "USD", "BDT");

    usdVat = usdTotalAmount * 0.15;
    usdDiscount = 0;
    usdGrandTotal = usdTotalAmount + usdVat - usdDiscount;
  }

  let fee = 0;
  let vat = totalAmount * 0.15;
  let discount = 0;
  let grandTotal = totalAmount + vat + fee - discount;

  let appointment = await Appointment.create({
    locationGenre,
    patient: patient._id,
    doctor: doctor._id,
    age,
    weight,
    reason,
    description,
    totalAmount,
    fee,
    vat,
    grandTotal,
    usdTotalAmount,
    usdVat,
    usdDiscount,
    usdGrandTotal,
    appointmentType,
    eyePhotos: eyePhotoLinks,
    additionalFiles: prescriptionLinks,
  });

  return appointment;
};

exports.getAppointmentList = async (filterOptions) => {
  let page = filterOptions.page || 1;
  let limit = filterOptions.limit || 10;
  let ids = filterOptions.ids || null;
  let _id = filterOptions?._id ? Types.ObjectId(filterOptions._id) : null;
  let dateFrom = filterOptions.dateFrom || null;
  let dateTo = filterOptions.dateTo || null;
  let query = filterOptions.query || null;
  let status = filterOptions.status || null;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Appointment.aggregate([
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$patient",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patient",
      },
    },
    {
      $unwind: {
        path: "$patient",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "ratings",
        localField: "_id",
        foreignField: "appointment",
        as: "rating",
      },
    },
    {
      $unwind: {
        path: "$rating",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        ...dateQuery,
        ...(query && {
          $or: [
            { "doctor.name": new RegExp(query, "i") },
            { "doctor.phone": new RegExp(query, "i") },
            { "patient.name": new RegExp(query, "i") },
            { "patient.phone": new RegExp(query, "i") },
            { _id: new RegExp(query, "i") },
          ],
        }),
        ...(status && { status }),
        ...(_id && { _id }),
        ...(ids && { _id: { $in: ids } }),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: AppointmentListInterface,
    },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let data = await Appointment.aggregatePaginate(aggregatedQuery, options);

  return data;
};

exports.getSingleAppointment = async (id) => {
  let data = await this.getAppointmentList({ _id: id });

  return data?.docs[0] ?? null;
};
