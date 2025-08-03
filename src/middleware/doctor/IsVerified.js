const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const Doctor = require("../../model/Doctor");
module.exports = catchAsync(async (req, res, next) => {
  let user = req.user || null;
  if (!user) {
    return next(new AppError("Authenticate this route first!", 401));
  }
  if (user.status != "activated") {
    return next(
      new AppError("You are not authorized to access this route!", 403)
    );
  }
  next();
});
