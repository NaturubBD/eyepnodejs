const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Specialty = require("../../model/Specialty");
const simpleValidator = require("../simpleValidator");


exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    title: "required",
  };

  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    title: "required",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Specialty.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let patient = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await Specialty.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
