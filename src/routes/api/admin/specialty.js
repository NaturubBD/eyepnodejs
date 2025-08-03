const SpecialtyController = require("../../../controller/admin/SpecialtyController");
const specialtyValidator = require("../../../validator/admin/specialtyValidator");

const specialtyRouter = require("express").Router();
require("express-group-routes");
specialtyRouter.group("/specialty", (specialty) => {
  specialty.get("/", SpecialtyController.list);
  specialty.get("/:id", SpecialtyController.detail);
  specialty.post("/", specialtyValidator.create, SpecialtyController.create);
  specialty.patch("/", specialtyValidator.update, SpecialtyController.update);
  specialty.delete(
    "/:id",
    specialtyValidator.delete,
    SpecialtyController.delete
  );
});
module.exports = specialtyRouter;
