const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const { generateWebToken } = require("../../traits/auth/WebTokenService");
const { createOtp } = require("../../traits/otp/OtpVerificationService");

exports.authRequest = catchAsync(async (req, res) => {
  let { dialCode, phone } = req.body;
  let fullPhone = `${dialCode}${phone}`;
  let otp = await createOtp(
    null,
    "doctor_auth",
    "phone",
    fullPhone,
    null,
    req.body
  );
  res.json({
    status: "success",
    message: "Otp sent to your phone!",
    data: { traceId: otp.traceId },
  });
});

exports.verifyAuth = catchAsync(async (req, res) => {
  let { trace, deviceToken } = req.body;

  if (!deviceToken) {
    throw new AppError("Device token is required", 422);
  }
  if (trace.criteria !== "doctor_auth") {
    throw new AppError("Invalid trace command provided", 422);
  }
  let { dialCode, phone } = trace.data;
  let checkExist = await Doctor.findOne({ phone });

  let doctor = await Doctor.findOneAndUpdate(
    { phone },
    {
      dialCode,
      phone,
      ...(!checkExist && { status: "waitingForApproval" }),
      deviceTokens: [deviceToken],
    },
    { upsert: true, new: true }
  );

  let token = await generateWebToken(doctor._id);
  console.log("Doctor Token: ",token);
  // if (doctor.status === "waitingForApproval") {
  //   token = null;
  // }
  res.json({
    status: "success",
    message: "Account verified successfully!",
    data: { token, doctor },
  });
});

exports.updateInformation = catchAsync(async (req, res) => {
  res.json({
    status: "success",
    message: "Status updated successfully!",
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Session destroyed successfully",
  });
});
