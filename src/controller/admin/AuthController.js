const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Admin = require("../../model/Admin");
const { generateWebToken } = require("../../traits/auth/WebTokenService");
const { createOtp } = require("../../traits/otp/OtpVerificationService");

exports.authRequest = catchAsync(async (req, res) => {
  let { dialCode, phone } = req.body;

  // First, check if admin already exists
  let admin = await Admin.findOne({ phone });

  // If not found, create a new one
  if (!admin) {
    admin = await Admin.create({
      dialCode,
      phone,
      status: "pending", // or "activated" if you prefer
    });
  }

  // Generate full phone for OTP
  let fullPhone = `${dialCode}${phone}`;

  // Generate OTP for admin auth
  let otp = await createOtp(
    null,
    "admin_auth",
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
  let { trace } = req.body;
  if (trace.criteria !== "admin_auth") {
    throw new AppError("Invalid trace command provided", 422);
  }
  let { dialCode, phone } = trace.data;

  let admin = await Admin.findOneAndUpdate(
    { phone },
    {
      dialCode,
      phone,
      status: "activated",
    },
    { upsert: true, new: true }
  );
  let token = await generateWebToken(admin._id);
  res.json({
    status: "success",
    message: "Account verified successfully!",
    data: { token },
  });
});

exports.logout = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Session destroyed successfully",
  });
});
