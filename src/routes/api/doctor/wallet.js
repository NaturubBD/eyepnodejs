const WalletController = require("../../../controller/doctor/WalletController");
const walletRouter = require("express").Router();
require("express-group-routes");
walletRouter.group("/wallet", (wallet) => {
  wallet.get("/transactions", WalletController.transactions);
  wallet.get("/statistics", WalletController.statistics);
  wallet.post("/submitWithdraw", WalletController.submitWithdraw);
});
module.exports = walletRouter;
