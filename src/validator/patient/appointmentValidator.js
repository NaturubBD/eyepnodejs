const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const Doctor = require("../../model/Doctor");
const Patient = require("../../model/Patient");
const simpleValidator = require("../simpleValidator");

exports.initAppointment = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    doctor: "required|mongoid",
    patient: "required|mongoid",
    age: "required|numeric",
    weight: "required|numeric",
    description: "required",
    appointmentType: "required|in:regular,followUp",
  };

  await simpleValidator(req.body, rules);

  let { patient, doctor } = req.body;
  let doctorInfo = await Doctor.findById(doctor);
  if (!doctorInfo) {
    throw new AppError("Invalid doctor id provided", 422);
  } else if (doctorInfo.status != "activated") {
    throw new AppError("Doctor is not activated yet!", 422);
  } else if (doctorInfo.availabilityStatus != "online") {
    throw new AppError(
      "Doctor is offline at this moment! Please try again later!",
      422
    );
  }

  let patientInfo = await Patient.findById(patient);
  if (!patientInfo) {
    throw new AppError("Invalid patient id provided", 422);
  }

  req.body.doctor = doctorInfo;
  req.body.patient = patientInfo;
  next();
});


exports.initiatePayment = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    appointment: "required|mongoid",
    paymentGateway: "required|in:bkash,sslcommerz",
  };

  await simpleValidator(req.body, rules);

  
  let { appointment } = req.body;
  let appointmentInfo = await Appointment.findById(appointment).populate(["doctor", "patient"]);
  if (!appointmentInfo) {
    throw new AppError("Invalid appointment id provided", 422);
  } else if (appointmentInfo.status != "waitingForPayment") {
    throw new AppError(
      `This appointment is ${appointmentInfo.status} already!`,
      422
    );
  }

  req.body.appointment = appointmentInfo
  next();
});

exports.markAsPaid = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    appointment: "required|mongoid",
    paymentId: "required",
    paymentMethod: "required",
  };

  await simpleValidator(req.body, rules);

  let { appointment } = req.body;
  let appointmentInfo = await Appointment.findById(appointment);
  if (!appointmentInfo) {
    throw new AppError("Invalid appointment id provided", 422);
  } else if (appointmentInfo.status != "waitingForPayment") {
    throw new AppError(
      `This appointment is ${appointmentInfo.status} already!`,
      422
    );
  }
  req.body.appointment = appointmentInfo;
  next();
});

exports.completeAppointment = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    id: "required|mongoid",
  };

  await simpleValidator(req.params, rules);

  await simpleValidator(req.query, { callDurationInSec: "required|numeric" });

  let { id } = req.params;
  // console.log(user._id, id);
  let appointmentInfo = await Appointment.findOne({
    _id: id,
    $or: [{ doctor: user._id }, { patient: user._id }],
  });
  if (!appointmentInfo) {
    throw new AppError("Invalid appointment id provided", 422);
  } else if (appointmentInfo.status != "queued") {
    throw new AppError(
      `Unable to mark a ${appointmentInfo.status} appointment`,
      422
    );
  }
  req.body.appointment = appointmentInfo;
  next();
});

exports.callNow = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    id: "required|mongoid",
  };

  await simpleValidator(req.params, rules);

  let { id } = req.params;
  let appointmentInfo = await Appointment.findOne({
    _id: id,
    $or: [{ doctor: user._id }, { patient: user._id }],
  })
    .populate("patient")
    .populate("doctor");
  if (!appointmentInfo) {
    throw new AppError("Invalid appointment id provided", 422);
  } else if (appointmentInfo.status != "queued") {
    // throw new AppError(
    //   `Unable to mark a ${appointmentInfo.status} appointment`,
    //   422
    // );
  }
  req.body.appointment = appointmentInfo;
  next();
});
