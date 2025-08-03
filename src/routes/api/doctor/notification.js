const NotificationController = require("../../../controller/doctor/NotificationController");
const notificationRouter = require("express").Router();
require("express-group-routes");
notificationRouter.group("/notification", (notification) => {
  notification.get("/", NotificationController.list);
});
module.exports = notificationRouter;
