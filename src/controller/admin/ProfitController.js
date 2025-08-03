const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const Transaction = require("../../model/Transaction");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const moment = require("moment");

exports.statistics = catchAsync(async (req, res) => {
  let user = req.user;
  let withdrawData = await Transaction.aggregate([
    {
      $match: {
        transactionType: "credit",
        criteria: "deposit",
        status: "confirmed",
      },
    },
    {
      $group: { _id: "$ownerType", total: { $sum: "$amount" } },
    },
  ]);

  let salesData = await Appointment.aggregate([
    {
      $match: {
        status: "completed",
      },
    },
    {
      $group: { _id: null, total: { $sum: "$grandTotal" } },
    },
  ]);

  let totalSales = salesData[0]?.total ?? 0;

  let data = {
    eyebuddy: 0,
    doctor: 0,
    profit: 0,
    totalSales,
  };

  withdrawData.map((i) => {
    if (i._id === "doctor") {
      data.doctor = i.total;
    } else if (i._id === "eyeBuddy") {
      data.eyebuddy = i.total;
    } else if (i._id === "hospitalAdmin") {
      data.profit = i.total;
    }
  });

  res.json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.chartData = catchAsync(async (req, res) => {
  let user = req.user;

  let dateFrom = moment.utc().startOf("year").toDate();
  let dateTo = moment.utc().endOf("year").toDate();
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let chartData = await Transaction.aggregate([
    {
      $match: {
        ...dateQuery,
        criteria: "deposit",
        ownerType: "hospitalAdmin",
      },
    },

    {
      $group: {
        _id: { $month: "$createdAt" },
        profit: { $sum: "$amount" },
      },
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        profit: 1,
      },
    },
  ]);
  res.json({
    status: "success",
    message: "Fetched successfully!",
    chartData,
  });
});
