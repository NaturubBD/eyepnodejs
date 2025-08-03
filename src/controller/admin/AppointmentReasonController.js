const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const AppointmentReason = require("../../model/AppointmentReason");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");

exports.list = catchAsync(async (req, res) => {
  let data = await AppointmentReason.aggregate([
    {
      $match: {},
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await AppointmentReason.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, description } = req.body;
  let record = await AppointmentReason.create({
    title,
    description,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { title, description, status, id } = req.body;
  let record = await AppointmentReason.findByIdAndUpdate(id, {
    title,
    description,
    ...(status && { status }),
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await AppointmentReason.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
