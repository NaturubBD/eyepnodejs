const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const Doctor = require("../../model/Doctor");
module.exports = catchAsync(async (req, res, next) => {
  let authenticated = false;
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Bearer token is required", 401);
  }
  try {
    var decoded = await jwt.verify(token, secret);
    let { userId } = decoded;
    let user = await Doctor.findById(userId);
    if (!user) {
      return next(
        new AppError(
          "The user belonging to this takes does no longer exist",
          401
        )
      );
    }

    if (user) {
      req.user = user;
      req.token = token;
      authenticated = true;
    }
  } catch (error) {
    return next(
      new AppError("The user belonging to this takes does no longer exist", 401)
    );
  }

  if (!authenticated) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  next();
});
