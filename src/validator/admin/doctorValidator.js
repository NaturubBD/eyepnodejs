const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Doctor = require("../../model/Doctor");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    specialty: "required|mongoid",
    hospital: "required|mongoid",
    experienceInYear: "required",
    bmdcCode: "required",
    gender: "required|in:male,female,other,none",
    consultationFee: "required|numeric",
    followupFee: "required|numeric",
    about: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);
  let { phone } = req.body;
  let checkExist = await Doctor.findOne({ phone });
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
    specialty: "required|mongoid",
    hospital: "required|mongoid",
    experienceInYear: "required",
    bmdcCode: "required",
    gender: "required|in:male,female,other,none",
    consultationFee: "required|numeric",
    followupFee: "required|numeric",
    about: "required",
    phone: "required",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Doctor.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await Doctor.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
