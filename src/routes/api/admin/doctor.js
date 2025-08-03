const DoctorController = require("../../../controller/admin/DoctorController");
const doctorValidator = require("../../../validator/admin/doctorValidator");

const doctorRouter = require("express").Router();
require("express-group-routes");
doctorRouter.group("/doctor", (doctor) => {
  doctor.get("/", DoctorController.list);
  doctor.get("/:id", DoctorController.detail);
  doctor.post("/", doctorValidator.create, DoctorController.create);
  doctor.patch("/", doctorValidator.update, DoctorController.update);
  doctor.delete("/:id", doctorValidator.delete, DoctorController.delete);
  doctor.patch("/toggleStatus/:id", DoctorController.toggleStatus);
});
module.exports = doctorRouter;
