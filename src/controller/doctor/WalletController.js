const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Transaction = require("../../model/Transaction");
const { getAvailableBalance } = require("../../traits/BalanceService");
const simpleValidator = require("../../validator/simpleValidator");
const AppError = require("../../exception/AppError");
const PaymentAccount = require("../../model/PaymentAccount");
const { transactionCreate } = require("../../traits/TransactionService");

exports.transactions = catchAsync(async (req, res) => {
  let user = req.user;
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let aggregatedQuery = Transaction.aggregate([
    {
      $match: {
        ownerType: "doctor",
        owner: Types.ObjectId(user._id),
      },
    },
    {
      $sort: {
        createdAt: -1,
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
  let data = await Transaction.aggregatePaginate(aggregatedQuery, options);
  data.docs = data.docs.map((i) => {
    return { ...i };
  });

  res.json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});
exports.statistics = catchAsync(async (req, res) => {
  let user = req.user;
  let balance = await getAvailableBalance("doctor", user);
  let earningData = await Transaction.aggregate([
    {
      $match: {
        ownerType: "doctor",
        transactionType: "credit",
        criteria: "deposit",
        status: "confirmed",
        owner: Types.ObjectId(user),
      },
    },
    {
      $group: { _id: null, total: { $sum: "$amount" } },
    },
  ]);
  let totalEarning = earningData[0]?.total ?? 0;

  let data = {
    balance,
    totalEarning,
  };

  res.json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.submitWithdraw = catchAsync(async (req, res) => {
  let user = req.user;
  simpleValidator(req.body, {
    amount: "required|numeric|gt:0",
    paymentAccount: "required|mongoid",
  });

  let { amount } = req.body;
  let paymentAccount = await PaymentAccount.findById(req.body.paymentAccount);
  if (!paymentAccount) {
    throw new AppError("Payment account not found", 422);
  }

  let balance = await getAvailableBalance("doctor", user);
  if (balance < amount) {
    throw new AppError("Withdraw failed because of insufficient amount", 422);
  }

  await transactionCreate(
    "doctor",
    user,
    {
      amount: amount,
      transactionType: "debit",
      criteria: "withdraw",
      note: `Withdraw amount to ${paymentAccount.accountNumber || ""}`,
      status: "pending",
      account: paymentAccount,
    },
    "debit"
  );

  res.json({
    status: "success",
    message: "Withdrawal submitted successfully!",
  });
});
