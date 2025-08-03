const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Admin = require("../../model/Admin");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const AppError = require("../../exception/AppError");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let user = req.user;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Admin.aggregate([
    {
      $match: {
        ...dateQuery,
        ...(query && {
          $or: [
            { name: new RegExp(query, "i") },
            { phone: new RegExp(query, "i") },
            { _id: new RegExp(query, "i") },
          ],
        }),
        ...(status && { status }),
      },
    },
    {
      $lookup: {
        from: "hospitals",
        localField: "branch",
        foreignField: "_id",
        as: "branch",
      },
    },
    {
      $unwind: {
        path: "$branch",
        preserveNullAndEmptyArrays: true,
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
  let data = await Admin.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Admin.findById(id).populate("branch");
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { name, dialCode, phone, role, branch } = req.body;
  let record = await Admin.create({
    name,
    dialCode,
    phone,
    role,
    status: "activated",
    branch,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { name, dialCode, phone, role, id, branch } = req.body;
  let record = await Admin.findByIdAndUpdate(id, {
    name,
    dialCode,
    phone,
    role,
    branch,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await Admin.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});

exports.toggleStatus = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) throw new AppError("Id is required", 422);
  let patient = await Admin.findById(id);
  if (!patient) {
    throw new AppError("Invalid patient id provided", 422);
  }

  patient = await Admin.findByIdAndUpdate(id, {
    status: patient.status == "activated" ? "disabled" : "activated",
  });
  res.json({
    status: "success",
    message: "Status changed successfully",
    data: {
      status: patient.status,
    },
  });
});
