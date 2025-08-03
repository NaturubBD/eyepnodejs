const ProfitController = require("../../../controller/admin/ProfitController");
const profitRouter = require("express").Router();
require("express-group-routes");
profitRouter.group("/profit", (profit) => {
  profit.get("/chartData", ProfitController.chartData);
  profit.get("/statistics", ProfitController.statistics);
});
module.exports = profitRouter;
