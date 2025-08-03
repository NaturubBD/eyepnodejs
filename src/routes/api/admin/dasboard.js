const DashboardController = require("../../../controller/admin/DashboardController");
const dashboardRouter = require("express").Router();
require("express-group-routes");
dashboardRouter.group("/dashboard", (dashboard) => {
  dashboard.get("/chartData", DashboardController.chartData);
  dashboard.get("/statistics", DashboardController.statistics);
});
module.exports = dashboardRouter;
