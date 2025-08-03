const moment = require("moment");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const AppointmentListInterface = require("../../utils/AppointmentListInterface");
const {
  getAppointmentList,
  getSingleAppointment,
} = require("../../traits/AppointmentService");
const AppointmentRescheduled = require("../../events/AppointmentRescheduled");
const AppointmentRefunded = require("../../events/AppointmentRefunded");
const { initializeCallSession } = require("../../traits/AgoraService");

exports.list = catchAsync(async (req, res) => {
  let filterOptions = req.query;

  let data = await getAppointmentList(filterOptions);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.cancelAndRefund = catchAsync(async (req, res) => {
  let { id } = req.params;

  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError("Invalid appointment id provided", 422);
  }
  if (["waitingForPayment", "refunded"].indexOf(appointment.status) != -1) {
    throw new AppError("You cannot refund this appointment", 422);
  }

  await Appointment.findByIdAndUpdate(appointment._id, {
    status: "refunded",
  });


  AppointmentRefunded(id)
  res.json({
    status: "success",
    message: "Refunded successfully",
  });
});

exports.reschedule = catchAsync(async (req, res) => {
  let { id } = req.params;

  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError("Invalid appointment id provided", 422);
  }
  if (
    ["waitingForPayment", "refunded", "queued"].indexOf(appointment.status) !=
    -1
  ) {
    throw new AppError("You cannot reschedule this appointment", 422);
  }

  await Appointment.findByIdAndUpdate(appointment._id, {
    status: "queued",
    date: moment.utc().toDate(),
  });

  await initializeCallSession(appointment);

  AppointmentRescheduled(id)
  res.json({
    status: "success",
    message: "Rescheduled successfully",
  });
});

exports.show = catchAsync(async (req, res) => {
  let { id } = req.params;

  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let data = await getSingleAppointment(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
