const AppError = require("../exception/AppError");
const catchAsync = require("../exception/catchAsync");
const User = require("../model/User");
const simpleValidator = require("./simpleValidator");

exports.profileUpdateValidation = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    dateOfBirth: "required",
    weight: "required",
    gender: "required",
  };

  await simpleValidator(req.body, rules);
  next();
});