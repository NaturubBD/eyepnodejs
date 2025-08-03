const AppError = require("../exception/AppError");
const Transaction = require("../model/Transaction");

exports.transactionCreate = async (
  ownerType,
  ownerId,
  data,
  transactionType = "credit"
) => {
  if (!data?.amount) {
    throw new AppError("Amount is required", 422);
  }

  let createData = {
    ...data,
    ownerType,
    transactionType,
    owner: ownerId,
  };
  let transaction = await Transaction.create(createData).catch((error) => {
    console.log(error.message);
    throw new AppError("Something went wrong", 500);
  });
  return transaction;
};
