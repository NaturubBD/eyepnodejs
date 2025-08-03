const PatientController = require("../../../controller/doctor/PatientController");
const patientRouter = require("express").Router();
require("express-group-routes");

patientRouter.group("/patient", (patient) => {
  patient.get("/basicInfo/:id", PatientController.info);
});
module.exports = patientRouter;
