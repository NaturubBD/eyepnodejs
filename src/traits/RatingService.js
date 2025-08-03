const { Types } = require("mongoose");
const Doctor = require("../model/Doctor");
const Rating = require("../model/Rating");

exports.syncDoctorRatingStats = async (doctorId) => {
  // let count = await Rating.countDocuments({ doctor: doctorId });
  // await Doctor.findByIdAndUpdate(doctorId, {

  // })

  let data = await Rating.aggregate([
    {
      $match: {
        doctor: Types.ObjectId(doctorId),
      },
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: "$rating" },
        count: { $sum: 1 },
        average: { $avg: "$rating" },
      },
    },
  ]);
  let count = data[0]?.count || 0;
  let average = data[0]?.average || 0;
  await Doctor.findByIdAndUpdate(doctorId, {
    ratingCount: count,
    averageRating: average,
  });
  return {
    count,
    average,
  };
};
