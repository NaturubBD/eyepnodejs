const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const Rating = require("../../model/Rating");
const { syncDoctorRatingStats } = require("../../traits/RatingService");

exports.submitRating = catchAsync(async (req, res) => {
  let user = req.user;
  let { rating, review, appointment } = req.body;
  await Rating.create({
    appointment: appointment._id,
    patient: appointment.patient,
    doctor: appointment.doctor,
    rating,
    review,
  });

  await Appointment.findByIdAndUpdate(appointment._id, {
    hasRating: true,
  });
  syncDoctorRatingStats(appointment.doctor._id);

  res.json({
    status: "success",
    message: "Submitted successfully",
  });
});

exports.getDoctorRating = catchAsync(async (req, res) => {
  let user = req.user;
  let { doctor } = req.query;

  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let aggregatedQuery = Rating.aggregate([
    {
      $match: {
        ...(doctor && { doctor: Types.ObjectId(doctor) }),
      },
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
      $project: {
        _id: 1,
        patient: {
          _id: 1,
          name: 1,
          photo: 1,
        },
        doctor: 1,
        rating: 1,
        review: 1,
        createdAt: 1,
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
  let data = await Rating.aggregatePaginate(aggregatedQuery, options);

  let statistics = await Rating.aggregate([
    {
      $match: {
        ...(doctor && { doctor: Types.ObjectId(doctor) }),
      },
    },
    {
      $bucket: {
        groupBy: "$rating",
        boundaries: [1, 2, 3, 4, 5],
        default: 5,
        output: {
          count: {
            $sum: 1,
          },
          average: {
            $avg: "$rating",
          },
        },
      },
    },
  ]);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
    statistics,
  });
});
