const catchAsync = require("../../exception/catchAsync");
const User = require("../../model/User");
const { generateWebToken } = require("../../traits/auth/WebTokenService");
const { createOtp } = require("../../traits/otp/OtpVerificationService");

exports.login = catchAsync(async (req, res) => {
  let { user } = req.body;
  let otp = await createOtp(user._id, "login", "phone", req.body);
  res.json({
    status: "success",
    message: "Otp sent to your phone!",
    data: { traceId: otp.traceId },
  });
});

exports.verifyLogin = catchAsync(async (req, res) => {
  let { trace } = req.body;
  let user = await User.findById(trace.user);
  if (!user) {
    throw new AppError("Invalid user encrypted!", 422);
  }
  let token = await generateWebToken(user._id);
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
