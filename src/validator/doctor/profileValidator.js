const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Hospital = require("../../model/Hospital");
const Specialty = require("../../model/Specialty");
const simpleValidator = require("../simpleValidator");

exports.basicInformationUpdate = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;
  let rules = {
    name: "required",
    specialty: "required|mongoid",
    hospital: "required|mongoid",
    experienceInYear: "required",
    bmdcCode: "required",
    gender: "required|in:male,female,other,none",
  };
  await simpleValidator(req.body, rules);

  let { specialty, hospital } = req.body;
  let specialtyInfo = await Specialty.findById(specialty);
  if (!specialtyInfo) {
    return next(new AppError("Invalid specialty id provided", 422));
  }
  let hospitalInfo = await Hospital.findById(hospital);
  if (!hospitalInfo) {
    return next(new AppError("Invalid hospital id provided", 422));
  }

  req.body.hospital = hospitalInfo;
  req.body.specialty = specialtyInfo;

  next();
});

exports.updateConsultationFee = catchAsync(async (req, res, next) => {
  let rules = {
    consultationFee: "required|numeric",
    followupFee: "required|numeric",
    about: "required",
  };
  await simpleValidator(req.body, rules);

  next();
});

exports.updateExperience = catchAsync(async (req, res, next) => {
  let rules = {
    records: "required|array",
  };
  await simpleValidator(req.body, rules);
  let { records } = req.body;
  records = records.filter((i) => {
    if (
      !i?.hospitalName ||
      !i?.designation ||
      !i?.department ||
      !i?.startDate
    ) {
      return false;
    } else if (!i.currentlyWorkingHere && !i.endDate) {
      return false;
    }

    return true;
  });

  req.body.records = records;
  if (records.length <= 0) {
    return next(new AppError("No valid  records found", 422));
  }
  next();
});
