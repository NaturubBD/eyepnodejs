const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const User = require("../../model/User");
const { generateWebToken } = require("../../traits/auth/WebTokenService");
const { createOtp } = require("../../traits/otp/OtpVerificationService");

exports.register = catchAsync(async (req, res) => {
  let otp = await createOtp(null, "register", "phone", req.body);
  res.json({
    status: "success",
    message: "Account created successfully!",
    data: { traceId: otp.traceId },
  });
});

exports.verifyRegister = catchAsync(async (req, res) => {
  let { trace } = req.body;
  let { data } = trace;
  let { phone, dialCode } = data;
  let checkPhone = await User.findOne({ phone });
  if (checkPhone) {
    throw new AppError("This phone is already verified!", 422);
  }
  let user = await User.create({
    phone,
    dialCode: dialCode,
    isVerified: true,
    status: "activated",
  });

  let token = await generateWebToken(user._id);
  res.json({
    status: "success",
    message: "Account verified successfully!",
    data: { token },
  });
});
