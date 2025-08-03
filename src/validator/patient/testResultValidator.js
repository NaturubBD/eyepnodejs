const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const TestResult = require("../../model/TestResult");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    attachment: "required",
    title: "required",
    patient: "required|mongoid",
  };
  await simpleValidator(req.body, rules);

  let { patient } = req.body;

  let checkPatient = await Patient.findOne({
    _id: patient,
    $or: [
      {
        parent: user._id,
      },
      {
        _id: user._id,
      },
    ],
  });
  if (!checkPatient) {
    return next(new AppError("Invalid Patient id provided", 422));
  }
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
  let check = await TestResult.findOne({ _id: id, patient: user });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }
  next();
  req.body.result = check;
});

exports.delete = catchAsync(async (req, res, next) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await TestResult.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
