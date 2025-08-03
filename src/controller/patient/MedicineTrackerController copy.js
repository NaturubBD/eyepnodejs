const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const MedicineTracker = require("../../model/MedicineTracker");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let { status } = req.query;
  let aggregatedQuery = MedicineTracker.aggregate([
    {
      $match: {
        ...(status && { status }),
        patient: user._id,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let data = await MedicineTracker.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await MedicineTracker.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, description, time, sat, sun, mon, tue, wed, thu, fri } =
    req.body;
  let record = await MedicineTracker.create({
    patient: req.user,
    title,
    description,
    time,
    sat,
    sun,
    mon,
    tue,
    wed,
    thu,
    fri,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;
  let {
    title,
    description,
    time,
    sat,
    sun,
    mon,
    tue,
    wed,
    thu,
    fri,
    id,
    status,
  } = req.body;
  let record = await MedicineTracker.findByIdAndUpdate(id, {
    title,
    description,
    time,
    sat,
    sun,
    mon,
    tue,
    wed,
    thu,
    fri,
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
  let record = await MedicineTracker.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
