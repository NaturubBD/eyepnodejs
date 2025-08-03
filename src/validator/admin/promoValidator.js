const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Promo = require("../../model/Promo");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    code: "required",
    discount: "required|numeric|min:0|max:100",
    discountFor: "required|in:all,selectedUsers",
    selectedUsers: "required_if:discountFor,selectedUsers",
  };

  await simpleValidator(req.body, rules);
  let { code } = req.body;
  let checkExist = await Promo.findOne({ code });
  if (checkExist) {
    return next(new AppError("Code already exists", 422));
  }
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    code: "required",
    discount: "required|numeric|min:0|max:100",
    discountFor: "required|in:all,selectedUsers",
    selectedUsers: "required_if:discountFor,selectedUsers",
  };
  await simpleValidator(req.body, rules);

  let { id, code } = req.body;
  let check = await Promo.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid promo id provided"));
  }

  let codeCheck = await Promo.findOne({ code, _id: { $ne: id } });
  if (codeCheck) {
    return next(new AppError("Code already exists", 422));
  }

  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let patient = req.user;
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await Promo.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid promo id provided", 422));
  }
  next();
});
