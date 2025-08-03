const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const MedicineTracker = require("../../model/MedicineTracker");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    title: "required",
    day: "required|in:sat,sun,mon,tue,wed,thu,fri",
    time: "required",
  };
  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    day: "required|in:sat,sun,mon,tue,wed,thu,fri",
    time: "required",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await MedicineTracker.findOne({ _id: id, patient: user });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await MedicineTracker.findOne({ _id: id, patient: user });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
