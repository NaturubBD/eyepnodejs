const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const AppError = require("../../exception/AppError");
const {
  getDoctorList,
  getSingleDoctor,
} = require("../../traits/doctor/DoctorService");

exports.list = catchAsync(async (req, res) => {
  let filterOptions = req.query;

  let data = await getDoctorList(filterOptions);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let data = await getSingleDoctor(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let {
    specialty,
    hospital,
    name,
    experienceInYear,
    gender,
    bmdcCode,
    consultationFee,
    followupFee,
    consultationFeeUsd,
    followupFeeUsd,
    about,
    phone,
    dialCode,
  } = req.body;
  let record = await Doctor.create({
    specialty,
    hospital,
    name,
    experienceInYear,
    gender,
    bmdcCode,
    consultationFee,
    followupFee,
    consultationFeeUsd,
    followupFeeUsd,
    about,
    status: "activated",
    phone,
    dialCode,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let {
    specialty,
    hospital,
    name,
    experienceInYear,
    gender,
    bmdcCode,
    consultationFee,
    followupFee,
    consultationFeeUsd,
    followupFeeUsd,
    about,
    phone,
    dialCode,
    id,
  } = req.body;
  let record = await Doctor.findByIdAndUpdate(id, {
    specialty,
    hospital,
    name,
    experienceInYear,
    gender,
    bmdcCode,
    consultationFee,
    followupFee,
    consultationFeeUsd,
    followupFeeUsd,
    about,
    phone,
    dialCode,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await Doctor.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});

exports.toggleStatus = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) throw new AppError("Id is required", 422);
  let doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new AppError("Invalid doctor id provided", 422);
  }

  doctor = await Doctor.findByIdAndUpdate(
    id,
    {
      status: doctor.status == "activated" ? "disabled" : "activated",
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Status changed successfully",
    data: {
      status: doctor.status,
    },
  });
});
