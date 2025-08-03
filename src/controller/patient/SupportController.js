const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Support = require("../../model/Support");
const SupportMessage = require("../../model/SupportMessage");
const simpleValidator = require("../../validator/simpleValidator");
const { uploadFileToS3FromBuffer } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");
const fs = require("fs");

exports.submitMessage = catchAsync(async (req, res) => {
  let user = req.user;
  await simpleValidator(req.body, {
    type: "required|in:existing,new",
    // subject: "required_if:type,new",
    supportId: "required_if:type,existing",
    content: "required",
    contentType: "required|in:text,attachment",
    // attachment: "required_if:contentType,attachment",
  });

  let { type, supportId, content, contentType, attachment } = req.body;
  if (type == "new") {
    let support = await Support.create({
      user: user._id,
      subject: content,
    });
    supportId = support._id;
  }

  if (contentType == "attachment") {
    var uploaded_file = req.files[0] ?? null;
    if (!uploaded_file) {
      throw new AppError("Attachment is required", 422);
    }
    let bufferData = uploaded_file?.buffer;
    let extension = uploaded_file?.mimetype?.split("/")[1] ?? "png";
    content = await uploadFileToS3FromBuffer(bufferData, extension, "/uploads")
      .then((data) => {
        console.log("data", data);
        return data?.Key ?? "";
      })
      .catch((err) => {
        console.log(err.message);
        throw new AppError("File Upload Error", 500);
      });
  }
  let message = await SupportMessage.create({
    support: supportId,
    content,
    senderType: "user",
    contentType,
  });
  io.to(supportId).emit("newSupportMessage", message);
  res.json({
    status: "success",
    message: "Sent successfully",
    supportId,
  });
});

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let status = req.query.status || null;
  let query = {
    user: new Types.ObjectId(user._id),
    ...(status && { status }),
  };

  let aggregatedQuery = Support.aggregate([
    {
      $match: query,
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
  let data = await Support.aggregatePaginate(aggregatedQuery, options);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});

exports.messages = catchAsync(async (req, res) => {
  let supportId = req.params.supportId;

  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let query = {
    support: new Types.ObjectId(supportId),
  };

  let aggregatedQuery = SupportMessage.aggregate([
    {
      $match: query,
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
  let data = await SupportMessage.aggregatePaginate(aggregatedQuery, options);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
