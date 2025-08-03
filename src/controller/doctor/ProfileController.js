const { uploadFileToS3 } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const Experience = require("../../model/Experience");
const { createOtp } = require("../../traits/otp/OtpVerificationService");
const simpleValidator = require("../../validator/simpleValidator");

exports.me = catchAsync(async (req, res) => {
  let user = req.user;

  let doctorInfo = await Doctor.findById(user._id)
    .populate("specialty", "title symptoms -_id")
    .populate("hospital", "-status -createdAt -updatedAt")
    .lean();
  let experiences = await Experience.find({ doctor: user._id })
    .select("-_id -createdAt -updatedAt -__v")
    .lean();
  res.json({
    status: "success",
    message: "Fetched successfully",
    data: { ...doctorInfo, experiences },
  });
});

exports.updateBasicProfile = catchAsync(async (req, res) => {
  let doctor = req.user;
  let { specialty, hospital, name, experienceInYear, gender, bmdcCode } =
    req.body;

  let user = await Doctor.findByIdAndUpdate(doctor._id, {
    specialty,
    hospital,
    name,
    experienceInYear,
    gender,
    bmdcCode,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.updateConsultationFee = catchAsync(async (req, res) => {
  let doctor = req.user;
  let { consultationFee, followupFee, about } = req.body;
  let user = await Doctor.findByIdAndUpdate(doctor._id, {
    consultationFee,
    followupFee,
    about,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.updateExperience = catchAsync(async (req, res) => {
  let doctor = req.user;
  let { records } = req.body;
  records = records.map((i) => {
    return { ...i, doctor };
  });
  await Experience.deleteMany({ doctor });
  await Experience.insertMany(records);

  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.updateAvailabilityStatus = catchAsync(async (req, res) => {
  let doctor = req.user;
  let { status } = req.params;
  if (status != "offline" && status != "online") {
    throw new AppError("Invalid status provided", 422);
  }

  await Doctor.findByIdAndUpdate(doctor._id, {
    availabilityStatus: status,
  });

  res.json({
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
    "doctor/profile"
  ).catch((err) => {
    console.log(err.message);
    return next(new AppError(500, "Something went wrong"));
  });

  let photo = uploadInfo?.Key || "";
  await Doctor.findByIdAndUpdate(user._id, {
    photo,
  });

  res.status(200).json({
    status: "success",
    message: "Uploaded successfully",
    uploadInfo,
  });
});

exports.uploadSignature = catchAsync(async (req, res, next) => {
  let { user } = req;
  const { base64String, fileExtension } = req.body;
  let uploadInfo = await uploadFileToS3(
    base64String,
    fileExtension,
    "doctor/signature"
  ).catch((err) => {
    console.log(err.message);
    return next(new AppError(500, "Something went wrong"));
  });

  let signature = uploadInfo?.Key || "";
  await Doctor.findByIdAndUpdate(user._id, {
    signature,
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
  let { phone, currentPhone } = req.body;
  let dialCode = "+880";
  let checkExists = await Doctor.findOne({ phone: currentPhone });
  if (!checkExists) {
    throw new AppError("Invalid current phone number");
  }
  let fullPhone = `${dialCode}${phone}`;
  let otp = await createOtp(
    null,
    "doctor_phone_change",
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
  if (trace.criteria !== "doctor_phone_change") {
    throw new AppError("Invalid trace command provided", 422);
  }
  let { dialCode, phone, currentPhone } = trace.data;
  dialCode = "+880";
  let doctor = await Doctor.findOneAndUpdate(
    { phone: currentPhone },
    {
      dialCode,
      phone,
      isVerified: true,
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Phone changed successfully!",
  });
});
