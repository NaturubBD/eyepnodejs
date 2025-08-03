const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
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
  let aggregatedQuery = Patient.aggregate([
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
  let data = await Patient.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Patient.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { name, dialCode, phone } = req.body;
  let record = await Patient.create({
    name,
    dialCode,
    phone,
    isVerified: true,
    status: "activated",
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { name, dialCode, phone, status, id } = req.body;
  let record = await Patient.findByIdAndUpdate(id, {
    name,
    dialCode,
    phone,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await Patient.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});

exports.toggleStatus = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) throw new AppError("Id is required", 422);
  let patient = await Patient.findById(id);
  if (!patient) {
    throw new AppError("Invalid patient id provided", 422);
  }

  patient = await Patient.findByIdAndUpdate(
    id,
    {
      status: patient.status == "activated" ? "disabled" : "activated",
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Status changed successfully",
    data: {
      status: patient.status,
    },
  });
});
