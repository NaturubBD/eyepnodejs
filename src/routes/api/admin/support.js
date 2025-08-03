const SupportController = require("../../../controller/admin/SupportController");
const supportRouter = require("express").Router();
require("express-group-routes");
supportRouter.group("/support", (support) => {
  support.patch("/markAsResolved/:supportId", SupportController.markAsResolved);
  support.patch("/acceptRequest/:supportId", SupportController.acceptRequest);
  support.post("/submit", SupportController.submitMessage);
  support.get("/messages/:supportId", SupportController.messages);
  support.get("/list", SupportController.list);
});
module.exports = supportRouter;
