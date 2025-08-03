const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Bank = require("../../model/Bank");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let type = req.query.type || null;
  let status = req.query.status || null;
  let user = req.user;

  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Bank.aggregate([
    {
      $match: {
        ...dateQuery,
        ...(status && { status }),
        ...(type && { type }),
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
  let data = await Bank.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Bank.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, type } = req.body;
  let record = await Bank.create({
    title,
    type,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { title, type, status, id } = req.body;
  let record = await Bank.findByIdAndUpdate(id, {
    title,
    type,
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
  let record = await Bank.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
