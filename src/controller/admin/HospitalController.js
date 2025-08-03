const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Hospital = require("../../model/Hospital");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let user = req.user;

  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Hospital.aggregate([
    {
      $match: {
        ...dateQuery,
        ...(query && { name: new RegExp(query, "i") }),
        ...(status && { status }),
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
  let data = await Hospital.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  res.json({
    status: "success",
    message: "Fetched successfully",
  });
});
exports.create = catchAsync(async (req, res) => {
  let { name, address, latitude, longitude, description } = req.body;
  // console.log(latitude, longitude);
  let record = await Hospital.create({
    name,
    address,

    "location.coordinates": [parseFloat(longitude), parseFloat(latitude)],
    description,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { name, address, latitude, longitude, description, status, id } =
    req.body;
  let record = await Hospital.findByIdAndUpdate(id, {
    name,
    address,
    "location.coordinates": [parseFloat(longitude), parseFloat(latitude)],
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
  let record = await Hospital.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
