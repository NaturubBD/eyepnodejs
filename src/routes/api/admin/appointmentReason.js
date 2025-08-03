const AppointmentReasonController = require("../../../controller/admin/AppointmentReasonController");
const appointmentReasonValidator = require("../../../validator/admin/appointmentReasonValidator");

const appointmentReasonRouter = require("express").Router();
require("express-group-routes");
appointmentReasonRouter.group("/appointmentReason", (appointmentReason) => {
  appointmentReason.get("/", AppointmentReasonController.list);
  appointmentReason.get("/:id", AppointmentReasonController.detail);
  appointmentReason.post("/", appointmentReasonValidator.create, AppointmentReasonController.create);
  appointmentReason.patch("/", appointmentReasonValidator.update, AppointmentReasonController.update);
  appointmentReason.delete(
    "/:id",
    appointmentReasonValidator.delete,
    AppointmentReasonController.delete
  );
});
module.exports = appointmentReasonRouter;
