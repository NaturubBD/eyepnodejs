const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Notification = require("../../model/Notification");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { notificationBroadcast } = require("../../traits/NotificationService");
const { uploadFileToS3 } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let type = req.query.type || null;
  let user = req.user;

  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Notification.aggregate([
    {
      $match: {
        ...dateQuery,
        ...(query && { title: new RegExp(query, "i") }),
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
  let data = await Notification.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Notification.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, body, type, castingType, banner, scheduledAt } = req.body;
  if (banner && Object.keys(banner).length) {
    let { base64String, fileExtension } = banner;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "/admin/promotionBanner"
    ).catch((err) => {
      console.log(err.message);
      throw new AppError(500, "Something went wrong");
    });
    // console.log(new Date());
    banner = uploadInfo?.Key ?? "";
  }

  let status = "scheduled";
  let notification = await Notification.create({
    title,
    body,
    type,
    banner,
    status,
    scheduledAt,
  });

  if (castingType == "now") {
    notificationBroadcast(notification);
  }
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;

  let { title, body, type, castingType, banner, scheduledAt, id } = req.body;
  if (banner) {
    let { base64String, fileExtension } = banner;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "admin/promotionBanner"
    ).catch((err) => {
      console.log(err.message);
      throw new AppError(500, "Something went wrong");
    });
    banner = uploadInfo?.Key ?? "";
  }

  let status = "scheduled";
  let record = await Notification.findByIdAndUpdate(id, {
    title,
    body,
    type,
    banner,
    status,
    scheduledAt,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let user = req.user;
  let { id } = req.params;
  let record = await Notification.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
