const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const PaymentAccount = require("../../model/PaymentAccount");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { Types } = require("mongoose");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let user = req.user;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = PaymentAccount.aggregate([
    {
      $match: {
        owner: Types.ObjectId(user),
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
  let data = await PaymentAccount.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await PaymentAccount.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let user = req.user;
  let { accountType, accountName, accountNumber, bankName, branch, district } =
    req.body;
  let record = await PaymentAccount.create({
    owner: user,
    ownerType: "doctor",
    accountType,
    accountName,
    accountNumber,
    bankName,
    branch,
    district,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let {
    accountType,
    accountName,
    accountNumber,
    bankName,
    branch,
    district,
    id,
    status,
  } = req.body;
  let record = await PaymentAccount.findByIdAndUpdate(id, {
    accountType,
    accountName,
    accountNumber,
    bankName,
    branch,
    district,
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
  let record = await PaymentAccount.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
