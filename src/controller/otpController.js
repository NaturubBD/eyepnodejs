const AppError = require("../exception/AppError");
const catchAsync = require("../exception/catchAsync");
const OtpVerification = require("../model/OtpVerification");
const { resendOtp } = require("../traits/otp/OtpVerificationService");

exports.resendOtp = catchAsync(async (req, res) => {
  let { traceId } = req.body;
  if (!traceId) {
    throw new AppError("Trace id is required", 422);
  }
  let trace = await OtpVerification.findOne({ traceId });

  if (trace.status != "pending") {
    throw new AppError(`You cannot resend a ${trace.status} trace`, 422);
  }
  resendOtp(trace._id);
  res.json({
    status: "success",
    message: "Sent successfully",
  });
});
