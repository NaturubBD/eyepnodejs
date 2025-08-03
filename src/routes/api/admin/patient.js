const PatientController = require("../../../controller/admin/PatientController");
const patientValidator = require("../../../validator/admin/patientValidator");

const patientRouter = require("express").Router();
require("express-group-routes");
patientRouter.group("/patient", (patient) => {
  patient.get("/", PatientController.list);
  patient.get("/:id", PatientController.detail);
  patient.post("/", patientValidator.create, PatientController.create);
  patient.patch("/", patientValidator.update, PatientController.update);
  patient.delete("/:id", patientValidator.delete, PatientController.delete);
  patient.patch("/toggleStatus/:id", PatientController.toggleStatus);
});
module.exports = patientRouter;
