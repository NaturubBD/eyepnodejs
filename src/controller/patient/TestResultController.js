const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const TestResult = require("../../model/TestResult");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { uploadFileToS3 } = require("../../config/FileUpload");
const Patient = require("../../model/Patient");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let user = req.user;
  let { status } = req.query;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);

  let { patient } = req.query;
  if (!patient) {
    patient = user._id;
  }

  let aggregatedQuery = TestResult.aggregate([
    {
      $match: {
        type: "clinical",
        ...dateQuery,
        ...(status && { status }),
        patient,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },

    {
      $project: {
        _id: 1,
        title: 1,
        attachment: 1,
        status: 1,
        createdAt: 1,
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
  let data = await TestResult.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.appTestList = catchAsync(async (req, res) => {
  let user = req.user;
  let { patient } = req.query;
  if (!patient) {
    patient = user._id;
  }
  let data = await TestResult.findOne({
    type: "app",
    patient,
  });
  res.json({
    status: "success",
    message: "Fetched successfully",
    data: data?.data || {},
  });
});

exports.updateAppTestResult = catchAsync(async (req, res) => {
  let user = req.user;
  let requestBody = req.body || {};
  let { data, patient } = requestBody;
  let checkPatient = await Patient.findOne({
    _id: patient,
    $or: [
      {
        parent: user._id,
      },
      {
        _id: user._id,
      },
    ],
  });
  if (!checkPatient) {
    throw new AppError("Invalid Patient id provided", 422);
  }

  let testData = await TestResult.findOneAndUpdate(
    {
      type: "app",
      patient,
    },
    {
      type: "app",
      data,
      patient,
    },
    { new: true, upsert: true }
  );
  res.json({
    status: "success",
    message: "Updated successfully",
    data: testData.data || {},
  });
});

exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await TestResult.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.create = catchAsync(async (req, res) => {
  let { type, data, attachment, patient, title } = req.body;
  data = {};
  let { base64String, fileExtension } = attachment;
  let uploadInfo = await uploadFileToS3(
    base64String,
    fileExtension,
    "patient/testResult"
  ).catch((err) => {
    throw new AppError(500, "Something went wrong");
  });
  attachment = uploadInfo?.Key || "";
  let record = await TestResult.create({
    patient: patient,
    type: "clinical",
    attachment,
    title,
  });
  res.json({
    status: "success",
    message: "Created successfully",
    attachment,
  });
});
exports.update = catchAsync(async (req, res) => {
  let { result, attachment, title, id } = req.body;

  let photo = result?.attachment;

  if (attachment && Object.keys(attachment).length) {
    let { base64String, fileExtension } = attachment;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "patient/testResult"
    ).catch((err) => {
      throw new AppError(500, "Something went wrong");
    });
    photo = uploadInfo?.Key || "";
  }
  let record = await TestResult.findByIdAndUpdate(id, {
    attachment: photo,
    title,
  });
  res.json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let { id } = req.params;

  await TestResult.findByIdAndDelete(id);

  res.json({
    status: "success",
    message: "Delete successfully",
  });
});
