const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const {
  MarkAppointmentAsPaid,
  completeAppointment,
  initAppointment,
  calculateQueueStatus,
  getSingleAppointment,
} = require("../../traits/AppointmentService");
const AppointmentListInterface = require("../../utils/AppointmentListInterface");
const AppError = require("../../exception/AppError");
const AppointmentInitialized = require("../../events/AppointmentInitialized");
const { initiateSSLCommerzPayment } = require("../../traits/PaymentService");

exports.initAppointment = catchAsync(async (req, res) => {
  let {
    patient,
    doctor,
    age,
    weight,
    reason,
    description,
    eyePhotos,
    appointmentType,
    prescriptions,
    locationGenre,
  } = req.body;

  let appointment = await initAppointment(
    patient,
    doctor,
    {
      age,
      weight,
      reason,
      description,
      eyePhotos,
      appointmentType,
      prescriptions,
    },
    locationGenre
  );

  AppointmentInitialized(appointment._id);
  res.status(201).json({
    status: "success",
    message: "Initialized successfully! Waiting for payment",
    appointment,
  });
});
exports.initiatePayment = catchAsync(async (req, res) => {

  let {appointment} = req.body
  
  let url = await initiateSSLCommerzPayment(appointment);

  res.status(200).json({
    status: "success",
    message: "Initializing payment successfully",
    url,
  });
});


exports.handlePaymentFailed = catchAsync(async (req, res) => {
  let { appointment } = req.body;

  res.send("Failed");
});

exports.handlePaymentSuccess = catchAsync(async (req, res) => {
  let { appointment } = req.body;

  res.send("Success");
});

exports.handlePaymentCancel = catchAsync(async (req, res) => {
  let { appointment } = req.body;

  res.send("Cancelled");
});
exports.markAsPaid = catchAsync(async (req, res) => {
  let { appointment, paymentId, paymentMethod } = req.body;

  let queueStatus = await calculateQueueStatus(appointment.doctor);
  appointment = await MarkAppointmentAsPaid(
    appointment,
    paymentId,
    paymentMethod
  );

  res.status(201).json({
    status: "success",
    message: "Marked as paid successfully",
    queueStatus,
    appointment,
  });
});

exports.completeAppointment = catchAsync(async (req, res) => {
  let { appointment } = req.body;
  let { callDurationInSec } = req.query;
  appointment = await completeAppointment(appointment._id, callDurationInSec);

  res.status(201).json({
    status: "success",
    message: "Marked as completed successfully",
    appointment,
  });
});

exports.list = catchAsync(async (req, res) => {
  let user = req.user;
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let type = req.query.type || null;
  let patient = req.query.patient || user._id;
  let aggregatedQuery = Appointment.aggregate([
    {
      $match: {
        patient: Types.ObjectId(patient),
        ...(type == "past" && {
          status: "completed",
        }),
        ...(type == "upcoming" && {
          status: "queued",
          appointmentType: "regular",
        }),
        ...(type == "followup" && {
          // status: "queued",
          appointmentType: "followUp",
        }),
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
  data.docs = await Promise.all(
    data.docs.map(async (i) => {
      if (i.status == "queued") {
        let queueStatus = await calculateQueueStatus(i?.doctor?._id);
        return { ...i, queueStatus };
      }
      return { ...i };
    })
  );
  res.status(200).json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.detail = catchAsync(async (req, res) => {
  let { appointmentId } = req.params;

  if (!appointmentId) {
    throw new AppError("Appointment id is required", 422);
  }

  let appointmentInfo = await getSingleAppointment(appointmentId);
  if (!appointmentInfo) {
    throw new AppError("Invalid appointment id provided", 422);
  }

  let data = {
    appointment: appointmentInfo,
    queueStatus: await calculateQueueStatus(appointmentInfo.doctor._id),
  };
  // if (appointmentInfo.status === "queued") {
  //   data.queueStatus = await calculateQueueStatus(appointmentInfo.doctor._id);
  // }

  res.status(200).json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});
