const Appointment = require("../model/Appointment");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (appointmentId) => {
  let appointment = await Appointment.findById(appointmentId)
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");

  // Notify to patient
  await sendSystemNotification(
    "appointment",
    "Call Dropped!",
    `Seems the call for appointment #${appointment._id} has been dropped! We will contact with you soon`,
    "patient",
    appointment.patient,
    appointment
  );
  return true;
};
