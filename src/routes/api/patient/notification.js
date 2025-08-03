const NotificationController = require("../../../controller/patient/NotificationController");
const notificationRouter = require("express").Router();
require("express-group-routes");
notificationRouter.group("/notification", (notification) => {
  notification.get("/", NotificationController.list);
});
module.exports = notificationRouter;
