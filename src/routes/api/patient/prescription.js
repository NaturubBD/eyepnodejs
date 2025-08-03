const PrescriptionController = require("../../../controller/patient/PrescriptionController");
const prescriptionRouter = require("express").Router();
require("express-group-routes");
prescriptionRouter.group("/prescription", (prescription) => {
  prescription.get("/", PrescriptionController.list);
  prescription.post("/upload", PrescriptionController.upload);
  prescription.patch("/update", PrescriptionController.update);
  prescription.delete("/delete/:id", PrescriptionController.delete);
});
module.exports = prescriptionRouter;
