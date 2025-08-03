const catchAsync = require("../exception/catchAsync");
const User = require("../model/User");

exports.info = catchAsync(async (req, res) => {
  let { user } = req;
  res.status(200).json({
    status: "success",
    message: "Fetched successfully",
    data: user,
  });
});

exports.update = catchAsync(async (req, res) => {
  let { user } = req;
  let { name, dateOfBirth, weight, gender } = req.body;
  await User.findByIdAndUpdate(user._id, {
    name,
    dateOfBirth,
    weight,
    gender,
  });
  res.status(200).json({
    status: "success",
    message: "Updated successfully",
  });
});
