const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const { generateWebToken } = require("../../traits/auth/WebTokenService");
const { syncEyeHospitalPatient } = require("../../traits/auth/eyeHospital");
const { createOtp } = require("../../traits/otp/OtpVerificationService");

exports.request = catchAsync(async (req, res) => {
  let { dialCode, phone } = req.body;
  let fullPhone = `${dialCode}${phone}`;
  let otp = await createOtp(
    null,
    "patient_auth",
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
  if (trace.criteria !== "patient_auth") {
    throw new AppError("Invalid trace command provided", 422);
  }
  let { dialCode, phone } = trace.data;

  // let checkExist = await Patient.findOne({ phone });

  syncEyeHospitalPatient(phone);

  let patient = await Patient.findOneAndUpdate(
    { phone },
    {
      dialCode,
      phone,
      isVerified: true,
      status: "activated",
      deviceTokens: [deviceToken],
    },
    { upsert: true, new: true }
  );
  syncEyeHospitalPatient(phone);
  let token = await generateWebToken(patient._id);
  res.json({
    status: "success",
    message: "Account verified successfully!",
    data: { token, patient },
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Session destroyed successfully",
  });
});
