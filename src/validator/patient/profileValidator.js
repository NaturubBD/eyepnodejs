const catchAsync = require("../../exception/catchAsync");
const simpleValidator = require("../simpleValidator");

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