const MedicineTrackerController = require("../../../controller/patient/MedicineTrackerController");
const medicineTrackerValidator = require("../../../validator/patient/medicineTrackerValidator");

const medicineTrackerRouter = require("express").Router();
require("express-group-routes");
medicineTrackerRouter.group("/medicineTracker", (medicineTracker) => {
  medicineTracker.get("/", MedicineTrackerController.list);
  medicineTracker.post(
    "/",
    medicineTrackerValidator.create,
    MedicineTrackerController.create
  );
  medicineTracker.patch(
    "/",
    medicineTrackerValidator.update,
    MedicineTrackerController.update
  );
  medicineTracker.delete(
    "/:id",
    medicineTrackerValidator.delete,
    MedicineTrackerController.delete
  );
});
module.exports = medicineTrackerRouter;
