const Transaction = require("../model/Transaction");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (id) => {
  let transaction = await Transaction.findById(id);
  await sendSystemNotification(
    "withdraw",
    "Withdraw confirmed!",
    `Congratulations. Your withdraw ${id} has been confirmed`,
    "doctor",
    transaction.owner,
    transaction
  );
};
