const { pluck } = require("underscore");
const { uploadFileToS3 } = require("../../config/FileUpload");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Prescription = require("../../model/Prescription");
const simpleValidator = require("../../validator/simpleValidator");
const { Types } = require("mongoose");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let patients = req.patients;
  let { patient } = req.query;
  let query = {
    ...(patient && { patient: Types.ObjectId(patient) }),
    ...(!patient && { patient: { $in: pluck(patients, "_id") } }),
  };

  let aggregatedQuery = Prescription.aggregate([
    {
      $match: query,
    },

    {
      $lookup: {
        from: "patients",
        localField: "patient",
        foreignField: "_id",
        as: "patient",
      },
    },
    {
      $unwind: {
        path: "$patient",
        preserveNullAndEmptyArrays: true,
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
        file: 1,
        createdAt: 1,
        patient: {
          name: 1,
          _id: 1,
          phone: 1,
          photo: 1,
        },
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
  let data = await Prescription.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.upload = catchAsync(async (req, res) => {
  let { attachment, patient, title } = req.body;
  await simpleValidator(req.body, {
    title: "required",
    patient: "required|mongoid",
  });
  let { base64String, fileExtension } = attachment;
  let uploadInfo = await uploadFileToS3(
    base64String,
    fileExtension,
    "patient/prescription"
  ).catch((err) => {
    console.log(err.message);
    throw new AppError(500, "Something went wrong");
  });

  attachment = uploadInfo?.Key || "";
  let data = await Prescription.create({
    title,
    ...(patient && { patient }),
    ...(!patient && { patient: req.user }),
    file: attachment,
    type: "uploaded",
  });
  res.json({
    status: "success",
    message: "Uploaded successfully",
    data,
  });
});
exports.update = catchAsync(async (req, res) => {
  let { title, id } = req.body;
  await simpleValidator(req.body, {
    id: "required|mongoid",
    title: "required",
  });

  let check = await Prescription.findById(id);
  if (!check) {
    {
      throw new AppError("Invalid id provided", 422);
    }
  }

  await Prescription.findByIdAndUpdate(id, {
    title,
  });
  res.json({
    status: "success",
    message: "Uploaded successfully",
  });
});

exports.delete = catchAsync(async (req, res) => {
  let { id } = req.params;
  await Prescription.findByIdAndDelete(id);
  res.json({
    status: "success",
    message: "Delete successfully",
  });
});
