const AppError = require("../exception/AppError");
const catchAsync = require("../exception/catchAsync");
const AppointmentReason = require("../model/AppointmentReason");
const Bank = require("../model/Bank");
const Banner = require("../model/Banner");
const District = require("../model/District");
const Doctor = require("../model/Doctor");
const Hospital = require("../model/Hospital");
const PaymentAccount = require("../model/PaymentAccount");
const Specialty = require("../model/Specialty");
const { getNearbyHospital } = require("../traits/HospitalService");
const pug = require("pug");
const { getDoctorList } = require("../traits/doctor/DoctorService");
const { getAvailableBalance } = require("../traits/BalanceService");
const { uploadFileToS3FromBuffer } = require("../config/FileUpload");

exports.specialtiesList = catchAsync(async (req, res) => {
  let records = await Specialty.find({ status: "active" }).lean();
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.hospitalList = catchAsync(async (req, res) => {
  let records = await Hospital.find({ status: "active" }).lean();
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});
exports.districtList = catchAsync(async (req, res) => {
  let records = await District.find({ status: "active" }).lean();
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.getHospitalNearMe = catchAsync(async (req, res) => {
  let { longitude, latitude, radiusInKM, page, limit } = req.query;
  let records = await getNearbyHospital(
    longitude,
    latitude,
    { page, limit },
    radiusInKM
  );
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.getDoctorByPhone = catchAsync(async (req, res) => {
  let { phone } = req.params;
  if (!phone) {
    throw new AppError("Phone is required", 422);
  }
  let doctor = await Doctor.findOne({ phone: phone }).lean();
  if (!doctor) {
    throw new AppError("Invalid phone number provided", 422);
  }

  let balance = await getAvailableBalance("doctor", doctor._id);
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: { ...doctor, balance },
  });
});

exports.getPaymentAccountsByDoctor = catchAsync(async (req, res) => {
  let { id } = req.params;
  let { accountType } = req.query;
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let records = await PaymentAccount.find({
    owner: id,
    ...(accountType && { accountType }),
  });
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.getAppointmentReason = catchAsync(async (req, res) => {
  let records = await AppointmentReason.find({
    status: "active",
  });
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.banners = catchAsync(async (req, res) => {
  let records = await Banner.find({
    status: "active",
  });
  res.json({
    status: "success",
    message: "Fetched successfully!",
    data: records,
  });
});

exports.banks = catchAsync(async (req, res) => {
  let type = req.query.type || null;
  let status = req.query.status || null;
  let data = await Bank.aggregate([
    {
      $match: {
        status: "active",
        ...(type && { type }),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});

exports.doctorPublicProfile = catchAsync(async (req, res) => {
  let id = req.params?.id ?? null;
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let data = await getDoctorList({ _id: id });
  data = data.docs[0] || {};

  let { hospital, specialty, experiences } = data;

  console.log("first", data);
  let photo = process.env?.AWS_S3_URL + data?.photo;

  var html = pug.renderFile("src/template/doctor-profile.pug", {
    doctor: data,
    hospital,
    specialty,
    experiences,
    photo,
  });
  res.send(html);
});

exports.upload = catchAsync(async (req, res) => {
  var files = req.files ?? [];

  let uploadedFiles = [];

  await Promise.all(
    files.map(async (file) => {
      if (!file) {
        throw new AppError("Attachment is required", 422);
      }
      let bufferData = file?.buffer;
      let extension = file?.mimetype?.split("/")[1] ?? "png";
      await uploadFileToS3FromBuffer(bufferData, extension, "/uploads")
        .then((data) => {
          console.log("data", data);
          let url = data?.Key ?? "";
          if (url) {
            uploadedFiles.push(url);
          }
        })
        .catch((err) => {
          console.log(err.message);
          // throw new AppError("File Upload Error", 500);
        });
    })
  );

  res.json({
    status: "success",
    message: "Uploaded successfully",
    data: uploadedFiles,
  });
});
