const PatientAuthenticated = require("../../../middleware/PatientAuthenticated");
const appointmentRouter = require("./appointment");
const authRouter = require("./auth");
const doctorRouter = require("./doctor");
const medicineTrackerRouter = require("./medicineTracker");
const notificationRouter = require("./notification");
const myPatientRouter = require("./patients");
const prescriptionRouter = require("./prescription");
const profileRouter = require("./profile");
const promoRouter = require("./promo");
const ratingRouter = require("./rating");
const supportRouter = require("./support");
const testResultRouter = require("./testResult");

const patientRouter = require("express").Router();
require("express-group-routes");

patientRouter.group("/patient", (auth) => {
  auth.use(authRouter);
});

patientRouter.group("/patient", (patient) => {
  patient.use(PatientAuthenticated);
  patient.use(profileRouter);
  patient.use(myPatientRouter);
  patient.use(doctorRouter);
  patient.use(appointmentRouter);
  patient.use(medicineTrackerRouter);
  patient.use(testResultRouter);
  patient.use(promoRouter);
  patient.use(prescriptionRouter);
  patient.use(ratingRouter);
  patient.use(notificationRouter);
  patient.use(supportRouter);
});

module.exports = patientRouter;
