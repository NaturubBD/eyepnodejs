const AppointmentController = require("../../../controller/admin/AppointmentController");

const appointmentRouter = require("express").Router();
require("express-group-routes");
appointmentRouter.group("/appointment", (appointment) => {
  appointment.get("/list", AppointmentController.list);
  appointment.patch(
    "/cancelAndRefund/:id",
    AppointmentController.cancelAndRefund
  );
  appointment.patch("/reschedule/:id", AppointmentController.reschedule);
  appointment.get("/show/:id", AppointmentController.show);
});
module.exports = appointmentRouter;
