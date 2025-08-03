const { Types } = require("mongoose");
const catchAsync = require("../../exception/catchAsync");
const Transaction = require("../../model/Transaction");
const { getAvailableBalance } = require("../../traits/BalanceService");
const simpleValidator = require("../../validator/simpleValidator");
const AppError = require("../../exception/AppError");
const PaymentAccount = require("../../model/PaymentAccount");
const { transactionCreate } = require("../../traits/TransactionService");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { indexBy } = require("underscore");
const Doctor = require("../../model/Doctor");

exports.transactions = catchAsync(async (req, res) => {
  let user = req.user;
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let type = req?.query?.type || "doctor";
  let criteria = req?.query?.criteria ?? null;
  let status = req?.query?.status ?? null;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Transaction.aggregate([
    {
      $match: {
        ...dateQuery,
        ownerType: type,
        ...(criteria && { criteria }),
        ...(status && { status }),
      },
    },

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
    delete i.owner;
    if (i.ownerType == "doctor") {
      i.owner = i.doctor;
    }

    delete i.doctor;
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

  let balance = {
    hospital: await getAvailableBalance("hospitalAdmin"),
    doctors: await getAvailableBalance("doctor"),
    eyeBuddy: await getAvailableBalance("eyeBuddy"),
  };
  let earningData = await Transaction.aggregate([
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
  let indexedEarning = indexBy(earningData, "_id");

  let data = {
    balance,
    totalEarning: {
      hospital: indexedEarning?.hospitalAdmin?.total ?? 0,
      doctor: indexedEarning?.doctor?.total ?? 0,
      eyeBuddy: indexedEarning?.eyeBuddy?.total ?? 0,
    },
  };

  res.json({
    status: "success",
    message: "Fetched successfully!",
    data,
  });
});

exports.payToDoctor = catchAsync(async (req, res) => {
  let user = req.user;

  simpleValidator(req.body, {
    amount: "required|numeric|gt:0",
    doctor: "required|mongoid",
    paymentAccount: "required|mongoid",
  });

  let { amount } = req.body;

  let doctor = await Doctor.findById(req.body.doctor);
  let paymentAccount = await PaymentAccount.findOne({
    _id: req.body.paymentAccount,
    owner: doctor._id,
  });
  if (!paymentAccount) {
    throw new AppError("Payment account not found", 422);
  }

  let balance = await getAvailableBalance("doctor", doctor);
  if (balance < amount) {
    throw new AppError("Withdraw failed because of insufficient amount", 422);
  }

  await transactionCreate(
    "doctor",
    doctor,
    {
      amount: amount,
      transactionType: "debit",
      criteria: "withdraw",
      note: `Withdraw amount to ${paymentAccount.accountNumber || ""}`,
      status: "confirmed",
      account: paymentAccount,
    },
    "debit"
  );

  res.json({
    status: "success",
    message: "Payment updated  successfully!",
  });
});

exports.payToEyeBuddy = catchAsync(async (req, res) => {
  let user = req.user;

  simpleValidator(req.body, {
    amount: "required|numeric|gt:0",
  });

  let { amount, note } = req.body;

  let balance = await getAvailableBalance("eyeBuddy");
  if (balance < amount) {
    throw new AppError("Withdraw failed because of insufficient amount", 422);
  }

  await transactionCreate(
    "eyeBuddy",
    null,
    {
      amount: amount,
      transactionType: "debit",
      criteria: "withdraw",
      ...(note ? { note } : { note: `Paid to EyeBuddy` }),

      status: "confirmed",
    },
    "debit"
  );

  res.json({
    status: "success",
    message: "Payment updated  successfully!",
  });
});
