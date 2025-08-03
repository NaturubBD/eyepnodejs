const { Types } = require("mongoose");
const Transaction = require("../model/Transaction");

exports.getAvailableBalance = async (ownerType, owner = null) => {
  let creditData = await Transaction.aggregate([
    {
      $match: {
        ownerType: ownerType,
        transactionType: "credit",
        status: "confirmed",
        ...(owner && { owner: Types.ObjectId(owner) }),
      },
    },
    {
      $group: { _id: null, total: { $sum: "$amount" } },
    },
  ]);
  let totalCredit = creditData[0]?.total ?? 0;

  let debitData = await Transaction.aggregate([
    {
      $match: {
        ownerType: ownerType,
        transactionType: "debit",
        status: {
          $in: ["confirmed", "pending"],
        },
        ...(owner && { owner: Types.ObjectId(owner) }),
      },
    },
    {
      $group: { _id: null, total: { $sum: "$amount" } },
    },
  ]);
  let totalDebit = debitData[0]?.total ?? 0;
  return totalCredit - totalDebit;
};
