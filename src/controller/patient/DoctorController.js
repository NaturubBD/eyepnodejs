const { Types } = require("mongoose");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const Patient = require("../../model/Patient");
const { getDoctorList } = require("../../traits/doctor/DoctorService");
const { indexOf } = require("underscore");

exports.getList = catchAsync(async (req, res) => {
  let { user } = req;
  let filterOptions = {
    ...req.query,
    status: "activated",
    availabilityStatus: "online",
  };
  let records = await getDoctorList(filterOptions, user);
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.getFavoriteList = catchAsync(async (req, res) => {
  let { user } = req;
  let favoriteDoctors = user.favoriteDoctors || [];
  let filterOptions = { ...req.query, ids: favoriteDoctors };
  let records = await getDoctorList(filterOptions, user);
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.getInfo = catchAsync(async (req, res) => {
  let id = req.params.id || null;
  if (!id) {
    throw new AppError("Id is required", 422);
  }

  let data = await getDoctorList({ _id: id });
  data = data.docs[0] || null;
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.addFavorite = catchAsync(async (req, res) => {
  let { user } = req;
  let id = req.params.id || null;
  if (!id) {
    throw new AppError("Id is required", 422);
  }

  let doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new AppError("Invalid Id provided", 422);
  }
  let { favoriteDoctors } = user;
  if (favoriteDoctors.indexOf(id) !== -1) {
    throw new AppError("Already in the favorites list", 422);
  }
  favoriteDoctors.push(Types.ObjectId(id));
  await Patient.findByIdAndUpdate(user._id, {
    favoriteDoctors,
  });

  res.json({
    status: "success",
    message: "Updated successfully!",
  });
});

exports.removeFavorite = catchAsync(async (req, res) => {
  let { user } = req;
  let id = req.params.id || null;
  if (!id) {
    throw new AppError("Id is required", 422);
  }

  let doctor = await Doctor.findById(id);
  if (!doctor) {
    throw new AppError("Invalid Id provided", 422);
  }
  let { favoriteDoctors } = user;
  if (favoriteDoctors.indexOf(id) == -1) {
    throw new AppError("This id is not in the favorite list", 422);
  }
  favoriteDoctors.pull(Types.ObjectId(id));
  await Patient.findByIdAndUpdate(user._id, {
    favoriteDoctors,
  });

  res.json({
    status: "success",
    message: "Removed successfully!",
  });
});
