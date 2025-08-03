const AppError = require("../exception/AppError");
const catchAsync = require("../exception/catchAsync");
const User = require("../model/User");
const simpleValidator = require("./simpleValidator");

exports.loginValidation = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  let rules = {
    dialCode: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);
  let { phone, dialCode } = req.body;

  let user = await User.findOne({ phone });
  if (!user) {
    return next(new AppError("Invalid phone provided", 422));
  }
  req.body.user = user;
  next();
});
exports.registerValidation = catchAsync(async (req, res, next) => {
  let rules = {
    dialCode: "required",
    phone: "required",
  };

  await simpleValidator(req.body, rules);

  let { dialCode, phone } = req.body;
  let checkPhone = await User.findOne({ phone });
  if (checkPhone) {
    return next(new AppError("This phone already exists", 422));
  }
  next();
});
exports.verifyRegisterValidation = catchAsync(async (req, res, next) => {
  let rules = {
    traceId: "required",
    code: "required",
  };
  await simpleValidator(req.body, rules);

  let { traceId, code } = req.body;
  let checkTrace = await User.findOne({ phone });
  if (checkPhone) {
    return next(new AppError("This phone already exists", 422));
  }
  next();
});
