const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Hospital = require("../../model/Hospital");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    address: "required",
    latitude: "required|numeric",
    longitude: "required|numeric",
  };

  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    name: "required",
    address: "required",
    latitude: "required|numeric",
    longitude: "required|numeric",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Hospital.findOne({ _id: id });
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
  let check = await Hospital.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
