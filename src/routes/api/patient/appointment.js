const AppointmentController = require("../../../controller/patient/AppointmentController");
const DoctorController = require("../../../controller/patient/DoctorController");
const appointmentValidator = require("../../../validator/patient/appointmentValidator");
const appointmentRouter = require("express").Router();
require("express-group-routes");
appointmentRouter.group("/appointment", (appointment) => {
  appointment.post(
    "/init",
    appointmentValidator.initAppointment,
    AppointmentController.initAppointment
  );
  
  appointment.post(
    "/initiatePayment",
    appointmentValidator.initiatePayment,
    AppointmentController.initiatePayment
  );

  appointment.post(
    "/markAsPaid",
    appointmentValidator.markAsPaid,
    AppointmentController.markAsPaid
  );
  appointment.post(
    "/completeAppointment/:appointmentId",
    appointmentValidator.completeAppointment,
    AppointmentController.completeAppointment
  );

  appointment.get("/list", AppointmentController.list);
  appointment.get("/detail/:appointmentId", AppointmentController.detail);

});
module.exports = appointmentRouter;
