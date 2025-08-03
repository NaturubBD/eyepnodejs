const WalletController = require("../../../controller/admin/WalletController");
const walletRouter = require("express").Router();
require("express-group-routes");
walletRouter.group("/wallet", (wallet) => {
  wallet.get("/transactions", WalletController.transactions);
  wallet.get("/statistics", WalletController.statistics);
  wallet.post("/payToDoctor", WalletController.payToDoctor);
  wallet.post("/payToEyeBuddy", WalletController.payToEyeBuddy);
});
module.exports = walletRouter;
