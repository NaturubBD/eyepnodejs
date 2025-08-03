const HospitalController = require("../../../controller/admin/HospitalController");
const hospitalValidator = require("../../../validator/admin/hospitalValidator");

const hospitalRouter = require("express").Router();
require("express-group-routes");
hospitalRouter.group("/hospital", (hospital) => {
  hospital.get("/", HospitalController.list);
  hospital.get("/:id", HospitalController.detail);
  hospital.post("/", hospitalValidator.create, HospitalController.create);
  hospital.patch("/", hospitalValidator.update, HospitalController.update);
  hospital.delete("/:id", hospitalValidator.delete, HospitalController.delete);
});
module.exports = hospitalRouter;
