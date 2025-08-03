const AdminController = require("../../../controller/admin/AdminController");
const adminValidator = require("../../../validator/admin/adminValidator");

const subAdminRouter = require("express").Router();
require("express-group-routes");
subAdminRouter.group("/subAdmin", (admin) => {
  admin.get("/", AdminController.list);
  admin.get("/:id", AdminController.detail);
  admin.post("/", adminValidator.create, AdminController.create);
  admin.patch("/", adminValidator.update, AdminController.update);
  admin.delete("/:id", adminValidator.delete, AdminController.delete);
  admin.patch("/toggleStatus/:id", AdminController.toggleStatus);
});
module.exports = subAdminRouter;
