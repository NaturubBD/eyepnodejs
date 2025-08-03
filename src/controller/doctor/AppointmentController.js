const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const {
  completeAppointment,
  initAppointment,
} = require("../../traits/AppointmentService");
const TestResult = require("../../model/TestResult");
const Prescription = require("../../model/Prescription");
const AppError = require("../../exception/AppError");
const simpleValidator = require("../../validator/simpleValidator");
const AppointmentListInterface = require("../../utils/AppointmentListInterface");
const moment = require("moment");
const pug = require("pug");
const { uploadFileToS3FromBuffer } = require("../../config/FileUpload");
const PrescriptionSubmitted = require("../../events/PrescriptionSubmitted");
const AppointmentCompleted = require("../../events/AppointmentCompleted");
const AppointmentDropped = require("../../events/AppointmentDropped");
const AppointmentCalling = require("../../events/AppointmentCalling");
exports.callNow = catchAsync(async (req, res) => {
  let { appointment } = req.body;
  // appointment = await completeAppointment(appointment._id);

  AppointmentCalling(appointment._id);

  res.status(200).json({
    status: "success",
    message: "Notified to patient successfully",
    // appointment,
  });
});

exports.completeAppointment = catchAsync(async (req, res) => {
  let { appointment } = req.body;
  appointment = await completeAppointment(appointment._id);

  res.status(200).json({
    status: "success",
    message: "Marked as completed successfully",
    appointment,
  });
});
exports.markAsDropped = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let appointment = await Appointment.findOne({ _id: id, doctor: user._id })
    .populate("patient")
    .lean();
  if (!appointment) {
    throw new AppError("Id is not found", 422);
  }

  if (appointment.status != "queued") {
    throw new AppError(`Unable to mark a ${appointment.status} record`, 422);
  }
  await Appointment.findByIdAndUpdate(id, {
    status: "dropped",
  });

  AppointmentDropped(id);
  res.status(200).json({
    status: "success",
    message: "Marked as not answered",
  });
});
exports.details = catchAsync(async (req, res) => {
  let { id } = req.params;
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let appointment = await Appointment.findById(id)
    .populate("patient", "name phone dialCode photo _id")
    .lean();
  if (!appointment) {
    throw new AppError("Id is not found", 422);
  }

  let patientId = appointment?.patient?._id || null;
  if (!patientId) {
    throw new AppError("Patient is not exist", 422);
  }
  let eyeTest = {
    clinical: await TestResult.find({
      patient: patientId,
      type: "clinical",
    }).lean(),
    app:
      (await TestResult.findOne({ patient: patientId, type: "app" }).lean()) ??
      {},
  };
  let prescriptions = await Prescription.find({ patient: patientId }).lean();
  res.status(200).json({
    status: "success",
    message: "fetched successfully",
    data: {
      appointment,
      eyeTest,
      prescriptions,
    },
  });
});
exports.list = catchAsync(async (req, res) => {
  let user = req.user;
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let type = req.query.type || null;
  let patient = req.query?.patient || null;
  let aggregatedQuery = Appointment.aggregate([
    {
      $match: {
        doctor: Types.ObjectId(user._id),
        status: { $ne: "waitingForPayment" },
        ...(type == "past" && {
          status: "completed",
        }),
        ...(type == "upcoming" && {
          status: "queued",
          appointmentType: "regular",
        }),
        ...(type == "followup" && {
          status: "queued",
          appointmentType: "followUp",
        }),

        ...(patient && { patient: Types.ObjectId(patient) }),
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
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$doctor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $sort: {
        _id: -1,
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
  data.docs = data.docs.map((i) => {
    return { ...i };
  });
  res.status(200).json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.submitPrescription = catchAsync(async (req, res) => {
  simpleValidator(req.body, {
    id: "required|mongoid",
    medicines: "required|array",
    investigations: "required|array",
  });
  let {
    id,
    diagnosis,
    investigations,
    medicines,
    surgery,
    complaints,
    followUpDate,
    referredTo,
    note,
  } = req.body;

  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let appointment = await Appointment.findById(id)
    .populate("patient")
    .populate("doctor")
    .lean();
  if (!appointment) {
    throw new AppError("Id is not found", 422);
  }

  let appointmentDate = moment.utc(appointment.date).toDate();
  let followUpDateTime = moment
    .utc()
    .set({
      hour: appointmentDate.getUTCHours(),
      minute: appointmentDate.getUTCMinutes(),
    })
    .toDate();

  // if (appointment.status != "queued") {
  //   throw new AppError(`Unable to submit prescription`, 422);
  // }

  let patientId = appointment?.patient?._id || null;

  let doctorId = appointment?.doctor?._id || null;
  if (!patientId) {
    throw new AppError(`Patient not found`, 422);
  } else if (appointment.isPrescribed) {
    throw new AppError(`Prescribed already exists`, 422);
  } else if (followUpDate && moment) {
  }

  // Generate File
  var html_to_pdf = require("html-pdf-node");
  let data = {};

  let testResultData = await TestResult.findOne({
    type: "app",
    patient: patientId,
  });

  let testResult = {
    amdVision: {
      left: testResultData?.amdVision?.left ?? "",
      right: testResultData?.amdVision?.right ?? "",
    },
    colorVision: {
      left: testResultData?.colorVision?.left ?? "",
      right: testResultData?.colorVision?.right ?? "",
    },
    nearVision: {
      left: { os: testResultData?.nearVision?.left?.os ?? "" },
      right: { od: testResultData?.nearVision?.left?.od ?? "" },
    },
    visualAcuity: {
      left: { os: testResultData?.visualAcuity?.left?.os ?? "" },
      right: { od: testResultData?.visualAcuity?.left?.od ?? "" },
    },
  };
  // let testResult = {
  //   amdVision: { left: "1/18", right: "2/18" },
  //   colorVision: {
  //     left: "3/18",
  //     right: "4/18",
  //   },
  //   nearVision: {
  //     left: { os: "5/18" },
  //     right: { od: "6/18" },
  //   },
  //   visualAcuity: {
  //     left: {
  //       os: "7/18",
  //     },
  //     right: {
  //       od: "8/18",
  //     },
  //   },
  // };

  var html = pug.renderFile("src/template/prescription.pug", {
    appointment,
    doctor: appointment.doctor,
    patient: appointment.patient,
    diagnosis,
    investigations,
    medicines,
    surgery,
    followUpDate,
    referredTo,
    complaints: complaints?.join(", "),
    note,
    testResult,
  });
  let buffer = await html_to_pdf
    .generatePdf({ content: html }, { format: "A4" })
    .then((pdfBuffer) => {
      return pdfBuffer;
    });
  let file = await uploadFileToS3FromBuffer(buffer, "pdf", "prescription");

  // let prescription = await Prescription.create({
  //   patient: patientId,
  //   diagnosis,
  //   investigations,
  //   medicines,
  //   surgery,
  //   complaints,
  //   ...(followUpDate && { followUpDate: followUpDateTime }),
  //   referredTo,
  //   appointment: appointment._id,
  //   doctor: doctorId,
  //   note,
  //   file: file?.Key,
  // });

  // await Appointment.findByIdAndUpdate(appointment._id, {
  //   isPrescribed: true,
  // });

  // if (followUpDate) {
  //   await initAppointment(appointment?.patient, appointment.doctor, {
  //     age: appointment.age,
  //     weight: appointment.weight,
  //     reason: appointment.reason,
  //     description: appointment.description,
  //     eyePhotos: appointment.eyePhotos,
  //     appointmentType: "followUp",
  //     date: followUpDateTime,
  //   });
  // }

  // completeAppointment(appointment._id);

  // PrescriptionSubmitted(prescription, appointment);

  res.status(200).json({
    status: "success",
    message: "Prescribed successfully",
    file,
  });
});

exports.patientPrescriptionList = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let patient = req.params?.patientId || null;
  if (!patient) {
    throw new AppError("patient is required", 422);
  }
  let query = {
    ...(patient && { patient: Types.ObjectId(patient) }),
  };

  let aggregatedQuery = Prescription.aggregate([
    {
      $match: query,
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
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        file: 1,
        createdAt: 1,
        patient: {
          name: 1,
          _id: 1,
          phone: 1,
          photo: 1,
        },
      },
    },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let data = await Prescription.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
