const AdminAuthenticated = require("../../../middleware/admin/AdminAuthenticated");
const DoctorAuthenticated = require("../../../middleware/doctor/DoctorAuthenticated");
const appointmentRouter = require("./appointment");
const authRouter = require("./auth");
const notificationRouter = require("./notification");
const patientRouter = require("./patient");
const paymentAccountRouter = require("./paymentAccount");
const profileRouter = require("./profile");
const walletRouter = require("./wallet");

const doctorRouter = require("express").Router();
require("express-group-routes");

doctorRouter.group("/doctor", (auth) => {
  auth.use(authRouter);
});
doctorRouter.group("/doctor", (doctor) => {
  doctor.use(DoctorAuthenticated);
  doctor.use(profileRouter);
  doctor.use(appointmentRouter);
  doctor.use(patientRouter);
  doctor.use(walletRouter);
  doctor.use(paymentAccountRouter);
  doctor.use(notificationRouter);
});

module.exports = doctorRouter;
