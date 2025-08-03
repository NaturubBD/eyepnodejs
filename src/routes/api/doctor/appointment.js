const AppointmentController = require("../../../controller/doctor/AppointmentController");
const {
  completeAppointment,
  callNow,
} = require("../../../validator/patient/appointmentValidator");
const appointmentRouter = require("express").Router();
require("express-group-routes");

appointmentRouter.group("/appointment", (appointment) => {
  appointment.get("/list", AppointmentController.list);
  appointment.get("/details/:id", AppointmentController.details);
  appointment.patch("/markAsDropped/:id", AppointmentController.markAsDropped);
  appointment.patch(
    "/markAsCompleted/:id",
    completeAppointment,
    AppointmentController.completeAppointment
  );
  appointment.post(
    "/submitPrescription",
    AppointmentController.submitPrescription
  );
  appointment.get(
    "/patientPrescriptionList/:patientId",
    AppointmentController.patientPrescriptionList
  );
  appointment.get("/callNow/:id", callNow, AppointmentController.callNow);
});
module.exports = appointmentRouter;
