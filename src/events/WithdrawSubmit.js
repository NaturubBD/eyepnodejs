const Transaction = require("../model/Transaction");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (id) => {
  let transaction = await Transaction.findById(id);
  await sendSystemNotification(
    "withdraw",
    "Withdraw submitted!",
    `Withdraw has been submitted successfully. You will be notified soon`,
    "doctor",
    transaction.owner,
    transaction
  );
};
