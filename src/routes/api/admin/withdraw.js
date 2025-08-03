const WithdrawController = require("../../../controller/admin/WithdrawController");

const withdrawRouter = require("express").Router();
require("express-group-routes");
withdrawRouter.group("/withdraw", (withdraw) => {
  withdraw.get("/list", WithdrawController.list);
  withdraw.get("/statistics", WithdrawController.statistics);
  withdraw.patch("/approveWithdraw/:id", WithdrawController.approveWithdraw);
  withdraw.patch("/declineWithdraw/:id", WithdrawController.declineWithdraw);
});
module.exports = withdrawRouter;
