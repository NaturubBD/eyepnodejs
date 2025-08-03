const catchAsync = require("../../exception/catchAsync");
const Rating = require("../../model/Rating");

exports.getRatingStats = catchAsync(async (doctorId) => {
  const { avgRating, ratingCount } = await Rating.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]).exec()[0];

  const ratingList = await Rating.find({ doctor: doctorId })
    .populate("patient", "name")
    .select("-__v")
    .sort("-createdAt")
    .exec();
  return {
    success: true,
    avgRating,
    ratingCount,
    ratingList,
  };
});
