const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Support = require("../../model/Support");
const SupportMessage = require("../../model/SupportMessage");
const simpleValidator = require("../../validator/simpleValidator");
const { uploadFileToS3FromBuffer } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const moment = require("moment");

exports.markAsResolved = catchAsync(async (req, res) => {
  let user = req.user;

  let supportId = req?.params?.supportId ?? null;
  let { resolveNote } = req.body;

  await Support.findByIdAndUpdate(supportId, {
    status: "resolved",
    resolveNote,
    resolvedAt: moment.utc().toDate(),
  });
  res.json({
    status: "success",
    message: "Resolved successfully",
  });
});

exports.acceptRequest = catchAsync(async (req, res) => {
  let user = req.user;
  let supportId = req?.params?.supportId ?? null;
  let support = await Support.findByIdAndUpdate(
    supportId,
    {
      status: "inProgress",
      admin: user._id,
    },
    { new: true }
  );
  res.json({
    status: "success",
    message: "Accepted successfully",
    support,
  });
});

exports.submitMessage = catchAsync(async (req, res) => {
  let user = req.user;
  await simpleValidator(req.body, {
    supportId: "required|mongoid",
    content: "required_if:contentType,text",
    contentType: "required|in:text,attachment",
  });

  let { supportId, content, contentType } = req.body;

  let support = await Support.findById(supportId);
  if (!support) {
    throw new AppError("Invalid support id provided", 422);
  } else if (support.status != "inProgress") {
    throw new AppError(`This support is ${support.status} now`, 422);
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
    senderType: "admin",
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
  let user = req.user;
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Support.aggregate([
    {
      $lookup: {
        from: "patients",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "admins",
        localField: "admin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: {
        path: "$admin",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        ...dateQuery,
        ...(status && { status }),

        ...(status=="resolved" || status=="inProgress" && { "admin._id":user._id }),
        ...(query && {
          $or: [
            { "user.name": new RegExp(query, "i") },
            { "user.phone": new RegExp(query, "i") },
            { _id: new RegExp(query, "i") },
          ],
        }),
      },
    },
    {
      $sort: {
        resolvedAt: -1,
        createdAt: -1,
      },
    },

    {
      $project: {
        admin: {
          _id: 1,
          name: 1,
          phone: 1,
          photo: 1,
        },
        user: {
          _id: 1,
          name: 1,
          phone: 1,
          photo: 1,
          totalConsultationCount: 1,
        },
        subject: 1,
        status: 1,
        createdAt: 1,
        resolveNote: 1,
        resolvedAt: 1,
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

  let support = await Support.findById(supportId)
    .populate("user")
    .populate("admin");
  if (!support) {
    throw new AppError("Invalid support id provided", 422);
  }
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

  data.docs = data.docs.map((i) => {
    let sender = {};
    if (i.senderType == "admin") {
      sender = support.admin;
    } else {
      sender = support.user;
    }
    return { ...i, sender };
  });
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
