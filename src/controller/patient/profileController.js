const { uploadFileToS3 } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const { createOtp } = require("../../traits/otp/OtpVerificationService");
const simpleValidator = require("../../validator/simpleValidator");

exports.info = catchAsync(async (req, res) => {
  let { user } = req;
  res.status(200).json({
    status: "success",
    message: "Fetched successfully",
    data: user,
  });
});

exports.update = catchAsync(async (req, res) => {
  let { user } = req;
  let { name, dateOfBirth, weight, gender, email } = req.body;
  await Patient.findByIdAndUpdate(user._id, {
    name,
    dateOfBirth,
    weight,
    gender,
    email,
  });
  res.status(200).json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.uploadProfilePhoto = catchAsync(async (req, res, next) => {
  let { user } = req;
  const { base64String, fileExtension } = req.body;
  let uploadInfo = await uploadFileToS3(
    base64String,
    fileExtension,
    "patient/profile"
  ).catch((err) => {
    console.log(err.message);
    return next(new AppError(500, "Something went wrong"));
  });

  let photo = uploadInfo?.Key || "";
  let { name, dateOfBirth, weight, gender } = req.body;
  await Patient.findByIdAndUpdate(user._id, {
    photo,
  });

  res.status(200).json({
    status: "success",
    message: "Uploaded successfully",
    uploadInfo,
  });
});

exports.phoneChangeRequest = catchAsync(async (req, res) => {
  await simpleValidator(req.body, {
    // dialCode: "required",
    phone: "required",
    // currentDialCode: "required",
    currentPhone: "required",
  });
  let { dialCode, phone, currentPhone } = req.body;
  let checkExists = await Patient.findOne({ phone: currentPhone });
  if (!checkExists) {
    throw new AppError("Invalid current phone number");
  }
  let fullPhone = `${dialCode}${phone}`;
  let otp = await createOtp(
    null,
    "patient_phone_change",
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

exports.phoneChangeVerify = catchAsync(async (req, res) => {
  let { trace } = req.body;
  if (trace.criteria !== "patient_phone_change") {
    throw new AppError("Invalid trace command provided", 422);
  }
  let { phone, currentPhone } = trace.data;
  let dialCode = "+880";
  let patient = await Patient.findOneAndUpdate(
    { phone: currentPhone },
    {
      dialCode,
      phone,
      isVerified: true,
      status: "activated",
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Phone changed successfully!",
  });
});
