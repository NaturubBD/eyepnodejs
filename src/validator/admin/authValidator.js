const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const simpleValidator = require("../simpleValidator");

exports.authValidation = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  let rules = {
    dialCode: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);
  let { phone, dialCode } = req.body;

  next();
});
