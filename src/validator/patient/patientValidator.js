const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    dateOfBirth: "required",
    weight: "required",
    gender: "required",
    relation: "required",
  };

  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    name: "required",
    dateOfBirth: "required",
    weight: "required",
    gender: "required",
    relation: "required",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Patient.findOne({ _id: id, parent: user._id });
  if (!check) {
    return next(new AppError("Invalid patient id provided"));
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let patient = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("patient id is required"));
  }
  let check = await Patient.findOne({ _id: id, parent: patient._id });
  if (!check) {
    return next(new AppError("Invalid patient id provided", 422));
  }
  next();
});
