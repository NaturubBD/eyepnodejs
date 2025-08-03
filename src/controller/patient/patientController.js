const { uploadFileToS3 } = require("../../config/FileUpload");
const catchAsync = require("../../exception/catchAsync");
const Patient = require("../../model/Patient");
const Prescription = require("../../model/Prescription");

exports.list = catchAsync(async (req, res) => {
  let user = req.user;
  let records = [
    {
      _id: user._id,
      name: user.name,
      gender: user.gender,
      weight: user.weight,
      relation: "myself",
      dateOfBirth: user.dateOfBirth,
      photo: user.photo,
    },
  ];

  let tempRecords = await Patient.find({
    parent: user._id,
  })
    .select("name gender weight relation dateOfBirth photo")
    .lean();
  res.json({
    status: "success",
    message: "Fetched successfully",
    data: [...records, ...tempRecords],
  });
});
exports.create = catchAsync(async (req, res) => {
  let user = req.user;
  let { name, gender, weight, relation, dateOfBirth } = req.body;
  let record = await Patient.create({
    name,
    gender,
    weight,
    relation,
    dateOfBirth,
    parent: user._id,
    patientType: "relative",
  });

  // Prescription upload
  let prescriptions = req.body.prescriptions || [];
  let prescriptionLinks = [];
  for (const prescription of prescriptions) {
    let { base64String, fileExtension } = prescription;
    if (!base64String || !fileExtension) {
      continue;
    }
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "patient/prescription"
    );
    if (uploadInfo?.Key) {
      prescriptionLinks.push(uploadInfo.Key);

      await Prescription.create({
        patient: record._id,
        file: uploadInfo.Key,
        type: "uploaded",
      });
    }
  }

  // Profile Photo
  let photoData = req.body.profilePhoto || {};
  if (Object.keys(photoData).length > 0) {
    let { base64String, fileExtension } = photoData;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "patient/profile"
    ).catch((err) => {
      console.log(err.message);
      return next(new AppError(500, "Something went wrong"));
    });

    let photo = uploadInfo?.Key || "";
    await Patient.findByIdAndUpdate(record._id, {
      photo,
    });
  }

  res.json({
    status: "success",
    message: "Created successfully",
  });
});

exports.update = catchAsync(async (req, res) => {
  let user = req.user;
  let { name, gender, weight, relation, dateOfBirth, id } = req.body;
  let record = await Patient.findByIdAndUpdate(id, {
    name,
    gender,
    weight,
    relation,
    dateOfBirth,
    parent: user._id,
    patientType: "relative",
  });

  // Profile Photo
  let photoData = req.body.profilePhoto || {};
  if (Object.keys(photoData).length > 0) {
    let { base64String, fileExtension } = photoData;
    let uploadInfo = await uploadFileToS3(
      base64String,
      fileExtension,
      "patient/profile"
    ).catch((err) => {
      console.log(err.message);
      return next(new AppError(500, "Something went wrong"));
    });

    let photo = uploadInfo?.Key || "";
    await Patient.findByIdAndUpdate(record._id, {
      photo,
    });
  }
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
