const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const Patient = require("../../model/Patient");
const Transaction = require("../../model/Transaction");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const moment = require("moment");

exports.statistics = catchAsync(async (req, res) => {
  let user = req.user;
  let withdrawData = await Transaction.aggregate([
    {
      $match: {
        transactionType: "debit",
        criteria: "withdraw",
        // status: "pending",
      },
    },
    {
      $group: { _id: "$status", total: { $sum: "$amount" } },
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
  let patientCount = await Patient.countDocuments({ status: "activated" });

  let data = {
    totalPendingWithdrawal: 0,
    totalConfirmedWithdrawal: 0,
    totalSales,
    patientCount,
  };

  withdrawData.map((i) => {
    if (i._id === "pending") {
      data.totalPendingWithdrawal = i.total;
    } else if (i._id === "confirmed") {
      data.totalConfirmedWithdrawal = i.total;
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
  let dailySalesChart = await Appointment.aggregate([
    {
      $match: {
        status: "completed",
        ...dateQuery,
      },
    },

    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSaleAmount: { $sum: "$grandTotal" },
        appointmentCount: { $sum: 1 },
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
        date: "$_id",
        appointmentCount: 1,
        totalSaleAmount: 1,
      },
    },
  ]);
  res.json({
    status: "success",
    message: "Fetched successfully!",
    dailySalesChart,
  });
});
