const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);

  let { phone } = req.body;
  let checkExist = await Patient.findOne({ phone, patientType: "main" });
  if (checkExist) {
    throw new AppError("Phone number already exists", 422);
  }
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    name: "required",
    phone: "required",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Patient.findOne({ _id: id });
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
  let check = await Patient.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
