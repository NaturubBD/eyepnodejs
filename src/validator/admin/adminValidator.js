const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Admin = require("../../model/Admin");
const Hospital = require("../../model/Hospital");
const simpleValidator = require("../simpleValidator");

exports.create = catchAsync(async (req, res, next) => {
  let rules = {
    name: "required",
    phone: "required",
    role: "required|in:hospitalAdmin,eyeBuddyAdmin,customerSupportManager",
    branch: "required_if:role,hospitalAdmin,customerSupportManager",
  };

  await simpleValidator(req.body, rules);

  let check = await Admin.findOne({ phone: req.body.phone });
  if (check) {
    return next(new AppError("This phone already exists!"));
  }

  if (req?.body?.branch) {
    let branch = await Hospital.findById(req.body.branch);
    if (!branch) {
      return next(new AppError("Invalid branch id provided"));
    }
  }
  next();
});

exports.update = catchAsync(async (req, res, next) => {
  let user = req.user;
  let rules = {
    id: "required|mongoid",
    name: "required",
    phone: "required",
    role: "required|in:hospitalAdmin,eyeBuddyAdmin,customerSupportManager",
    branch: "required_if:role,hospitalAdmin,customerSupportManager",
  };
  await simpleValidator(req.body, rules);

  let { id } = req.body;
  let check = await Admin.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided"));
  }

  if (req?.body?.branch) {
    let branch = await Hospital.findById(req.body.branch);
    if (!branch) {
      return next(new AppError("Invalid branch id provided"));
    }
  }
  next();
});

exports.delete = catchAsync(async (req, res, next) => {
  let admin = req.user;
  let { id } = req.params;
  if (admin?.role != "superAdmin") {
    return next(new AppError("You are not allowed to this operation", 403));
  }
  if (!id) {
    return next(new AppError("Id is required"));
  }
  let check = await Admin.findOne({ _id: id });
  if (!check) {
    return next(new AppError("Invalid id provided", 422));
  }
  next();
});
