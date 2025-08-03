const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Banner = require("../../model/Banner");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { uploadFileToS3 } = require("../../config/FileUpload");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let user = req.user;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Banner.aggregate([
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
  let data = await Banner.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Banner.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { title, attachment, description } = req.body;
  let photo = null;

  if (Object.keys(attachment).length) {
    let { base64String, fileExtension } = attachment;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "admin/banner"
    ).catch((err) => {
      console.log(err.message);
      return next(new AppError(500, "Something went wrong"));
    });
    photo = uploadInfo?.Key || "";
  }

  let record = await Banner.create({
    title,
    description,
    file: photo,
  });
  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let { title, attachment, description, status, banner, id } = req.body;
  let photo = banner?.file;

  if (attachment && Object.keys(attachment).length) {
    let { base64String, fileExtension } = attachment;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "admin/banner"
    ).catch((err) => {
      console.log(err.message);
      return next(new AppError(500, "Something went wrong"));
    });
    photo = uploadInfo?.Key || "";
  }

  let record = await Banner.findByIdAndUpdate(id, {
    title,
    description,
    photo,
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
  let record = await Banner.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Deleted successfully",
  });
});
