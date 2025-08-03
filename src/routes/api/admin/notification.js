const NotificationController = require("../../../controller/admin/NotificationController");
const notificationValidator = require("../../../validator/admin/notificationValidator");

const notificationRouter = require("express").Router();
require("express-group-routes");
notificationRouter.group("/notification", (notification) => {
  notification.get("/", NotificationController.list);
  notification.get("/:id", NotificationController.detail);
  notification.post(
    "/",
    notificationValidator.create,
    NotificationController.create
  );
  notification.patch(
    "/",
    notificationValidator.update,
    NotificationController.update
  );
  notification.delete(
    "/:id",
    notificationValidator.delete,
    NotificationController.delete
  );
});
module.exports = notificationRouter;
