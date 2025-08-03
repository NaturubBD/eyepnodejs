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

  // Notify Patient
  await sendSystemNotification(
    "appointment",
    "Payment completed successfully!",
    `Payment of appointment ${appointment._id} via ${appointment.paymentMethod} completed successfully`,
    "patient",
    appointment.patient,
    appointment
  );
  // Notify Doctor
  await sendSystemNotification(
    "appointment",
    "A patient has requested for appointment!",
    `${appointment?.patient?.name || ""} has been confirmed for appointment ${
      appointment._id
    }.`,
    "doctor",
    appointment.doctor,
    appointment
  );
};
