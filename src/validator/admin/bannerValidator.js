const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Banner = require("../../model/Banner");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    title: "required",
    attachment: "required",
  };

  await simpleValidator(req.body, rules);
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    title: "required",
  };

  let { id } = req.body;
  await simpleValidator(req.body, rules);
  let banner = await Banner.findOne({ _id: id });
  if (!banner) {
    return next(new AppError("Invalid promo id provided", 422));
  }

  req.body.banner = banner;

  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let { id } = req.params;
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await Banner.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid promo id provided", 422));
  }
  next();
});
