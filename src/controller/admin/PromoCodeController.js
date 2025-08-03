const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Promo = require("../../model/Promo");
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

  let dateQuery = dateQueryGenerator(
    dateFrom,
    dateTo,
    "validFrom",
    "validTill"
  );
  let aggregatedQuery = Promo.aggregate([
    {
      $match: {
        ...dateQuery,

        ...(query && { code: new RegExp(query, "i") }),
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
  let data = await Promo.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let user = req.user;
  let {
    code,
    discount,
    minimumPurchase,
    maximumDiscount,
    validFrom,
    validTill,
    discountFor,
    selectedUsers,
  } = req.body;
  if (discountFor == "all") {
    selectedUsers = null;
  }
  let record = await Promo.create({
    code,
    discount,
    ...(minimumPurchase && { minimumPurchase }),
    ...(maximumDiscount && { maximumDiscount: maximumDiscount }),
    ...(validFrom && { validFrom: new Date(validFrom) }),
    ...(validTill && { validTill: new Date(validTill) }),
    ...(selectedUsers && { selectedUsers }),
    discountFor,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;
  let {
    id,
    code,
    discount,
    minimumPurchase,
    maximumDiscount,
    validFrom,
    validTill,
    discountFor,
    selectedUsers,
    status,
  } = req.body;
  if (discountFor == "all") {
    selectedUsers = null;
  }
  let record = await Promo.findByIdAndUpdate(id, {
    code,
    discount,
    ...(minimumPurchase && { minimumPurchase }),
    ...(maximumDiscount && { maximumDiscount: maximumDiscount }),
    ...(validFrom && { validFrom: new Date(validFrom) }),
    ...(validTill && { validTill: new Date(validTill) }),
    ...(selectedUsers && { selectedUsers }),
    discountFor,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await Promo.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});

exports.toggleStatus = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  if (!id) throw new AppError("Id is required", 422);
  let promo = await Promo.findById(id);
  if (!promo) {
    throw new AppError("Invalid promo id provided", 422);
  }

  promo = await Promo.findByIdAndUpdate(
    id,
    {
      status: promo.status == "active" ? "inactive" : "active",
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Status changed successfully",
    data: {
      status: promo.status,
    },
  });
});
