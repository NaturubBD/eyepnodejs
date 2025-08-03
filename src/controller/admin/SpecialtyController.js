const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Specialty = require("../../model/Specialty");
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
  let aggregatedQuery = Specialty.aggregate([
    {
      $match: {
        ...dateQuery,
        ...(query && { title: new RegExp(query, "i") }),
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
  let data = await Specialty.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Specialty.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, symptoms } = req.body;
  let record = await Specialty.create({
    title,
    symptoms,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { title, symptoms, status, id } = req.body;
  let record = await Specialty.findByIdAndUpdate(id, {
    title,
    symptoms,
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
  let record = await Specialty.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
