const MarkAppointmentAsLate = require("./MarkAppointmentAsLate");
const NotifyPatientForRating = require("./NotifyPatientForRating");
const DeleteUnpaidAppointment = require("./DeleteUnpaidAppointment");
const PushScheduledNotification = require("./PushScheduledNotification");
const NotifyForFollowUp = require("./NotifyForFollowUp");

// Cronjob controller
MarkAppointmentAsLate.start();
NotifyPatientForRating.start();
DeleteUnpaidAppointment.start();
NotifyForFollowUp.start();
PushScheduledNotification.start();
