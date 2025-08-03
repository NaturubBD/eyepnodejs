const patientController = require("../../../controller/patient/patientController");
const patientValidator = require("../../../validator/patient/patientValidator");

const myPatientRouter = require("express").Router();
require("express-group-routes");
myPatientRouter.group("/myPatients", (profile) => {
  profile.get("/", patientController.list);
  profile.post("/", patientValidator.create, patientController.create);
  profile.patch("/", patientValidator.update, patientController.update);
  profile.delete("/:id", patientValidator.delete, patientController.delete);
});
module.exports = myPatientRouter;
