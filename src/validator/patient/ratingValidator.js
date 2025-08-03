const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const simpleValidator = require("../simpleValidator");

exports.submitRatingValidator = catchAsync(async (req, res, next) => {
  let { user } = req;
  let rules = {
    appointment: "required|mongoid",
    rating: "required|numeric|min:0|max:5",
    review: "required",
  };
  await simpleValidator(req.body, rules);
  let appointment = await Appointment.findById(req.body.appointment)
    .populate("patient")
    .populate("doctor");
  if (!appointment) {
    throw new AppError("Invalid id provided", 422);
  } else if (appointment.status != "completed") {
    throw new AppError("The appointment has not completed yet!", 422);
  } else if (appointment.hasRating) {
    throw new AppError("Rating submitted already!", 422);
  } else if (appointment.patient.phone != user.phone) {
    throw new AppError("You are not authorized!", 403);
  }

  req.body.appointment = appointment;
  next();
});
