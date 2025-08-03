const SupportController = require("../../../controller/patient/SupportController");
const supportRouter = require("express").Router();
require("express-group-routes");
supportRouter.group("/support", (support) => {
  support.post("/submit", SupportController.submitMessage);
  support.get("/messages/:supportId", SupportController.messages);
  support.get("/list", SupportController.list);
});
module.exports = supportRouter;
