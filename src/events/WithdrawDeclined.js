const Transaction = require("../model/Transaction");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (id) => {
  let transaction = await Transaction.findById(id);
  await sendSystemNotification(
    "withdraw",
    "Withdraw declined!",
    `Your withdraw ${id} has been declined`,
    "doctor",
    transaction.owner,
    transaction
  );
};
