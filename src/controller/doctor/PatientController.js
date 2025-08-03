const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const Experience = require("../../model/Experience");
const Patient = require("../../model/Patient");
const { createOtp } = require("../../traits/otp/OtpVerificationService");
const simpleValidator = require("../../validator/simpleValidator");

exports.info = catchAsync(async (req, res) => {
  let { id } = req.params;
  if (id) {
    throw new AppError("Id is required", 422);
  }
  let patient = await Patient.findById(id);
  if (patient) {
    throw new AppError("Patient not found", 422);
  }
  res.json({
    status: "success",
    message: "Fetched successfully",
  });
});
