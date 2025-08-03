const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const PaymentAccount = require("../../model/PaymentAccount");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    accountType: "required|in:bank,mfs",
    bankName: "required",
    accountNumber: "required",
    accountName: "required",
    branch: "required_if:accountType,bank",
    district: "required_if:accountType,bank",
  };

  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    accountType: "required|in:bank,mfs",
    bankName: "required",
    accountNumber: "required",
    accountName: "required",
    branch: "required_if:accountType,bank",
    district: "required_if:accountType,bank",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await PaymentAccount.findOne({ _id: id, owner: user._id });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await PaymentAccount.findOne({ _id: id, owner: user._id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
