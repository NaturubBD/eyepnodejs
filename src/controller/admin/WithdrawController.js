const WithdrawConfirmed = require("../../events/WithdrawConfirmed");
const WithdrawDeclined = require("../../events/WithdrawDeclined");
const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Transaction = require("../../model/Transaction");
const WithdrawalListInterface = require("../../utils/WithdrawalListInterface");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const simpleValidator = require("../../validator/simpleValidator");

const moment = require("moment");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let query = req.query.query || null;
  let status = req.query.status || null;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Transaction.aggregate([
    {
      $lookup: {
        from: "doctors",
        localField: "owner",
        foreignField: "_id",
        as: "doctor",
      },
    },
    {
      $unwind: {
        path: "$doctor",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "paymentaccounts",
        localField: "account",
        foreignField: "_id",
        as: "account",
      },
    },
    {
      $unwind: {
        path: "$account",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        ...dateQuery,
        ...(query && {
          $or: [
            { "doctor.name": new RegExp(query, "i") },
            { "doctor.phone": new RegExp(query, "i") },
          ],
        }),
        ...(status && { status }),
        criteria: "withdraw",
        transactionType: "debit",
      },
    },
    {
      $sort: {
        ...(status == "confirmed" && {
          confirmedAt: -1,
        }),
        createdAt: -1,
      },
    },
    {
      $project: WithdrawalListInterface,
    },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let data = await Transaction.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.detail = catchAsync(async (req, res) => {
  let { id } = req.params;
  let data = await Transaction.findById(id);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});

exports.approveWithdraw = catchAsync(async (req, res) => {
  let { id } = req.params;
  let { transferredBy } = req.body;
  await simpleValidator(req.body, {
    transferredBy: "required|in:bank,cash,cheque,none",
  });
  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new AppError("Invalid transaction id provided", 422);
  } else if (transaction.status != "pending") {
    throw new AppError(`This withdraw is already ${transaction.status}`, 422);
  }

  await Transaction.findByIdAndUpdate(id, {
    status: "confirmed",
    transferredBy,
    confirmedAt: moment.utc().toDate(),
  });

  WithdrawConfirmed(id);

  res.json({
    status: "success",
    message: "Withdraw approved successfully",
  });
});

exports.declineWithdraw = catchAsync(async (req, res) => {
  let { id } = req.params;

  if (!id) {
    throw new AppError("Id is required", 422);
  }
  let transaction = await Transaction.findById(id);
  if (!transaction) {
    throw new AppError("Invalid transaction id provided", 422);
  }

  await Transaction.findByIdAndUpdate(id, {
    status: "declined",
  });

  WithdrawDeclined(id);

  res.json({
    status: "success",
    message: "Withdraw declined successfully",
  });
});

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

  let data = {
    totalPendingWithdrawal: 0,
    totalConfirmedWithdrawal: 0,
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
