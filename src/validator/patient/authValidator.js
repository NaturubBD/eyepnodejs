const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const simpleValidator = require("../simpleValidator");

exports.authRequestValidator = catchAsync(async (req, res, next) => {
  let rules = {
    dialCode: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);
  next();
});
