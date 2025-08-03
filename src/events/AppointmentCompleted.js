const Appointment = require("../model/Appointment");
const Notification = require("../model/Notification");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (appointmentId) => {
  let appointment = await Appointment.findById(appointmentId)
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");
  await sendSystemNotification(
    "appointment",
    "Payment completed!",
    "Payment completed successfully!",
    // `Payment of appointment ${appointment._id} via ${appointment.paymentMethod} completed successfully`,
    "patient",
    appointment.patient,
    appointment
  );
  return true;
};
