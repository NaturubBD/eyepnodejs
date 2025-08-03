const Appointment = require("../model/Appointment");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (appointmentId) => {
  let appointment = await Appointment.findById(appointmentId)
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");
  // Notify patient
  await sendSystemNotification(
    "appointment",
    "Appointment cancelled!",
    `Appointment ${appointment._id} has been cancelled for some reason! We will contact you soon`,
    "patient",
    appointment.patient,
    appointment
  );

  // Notify doctor
  await sendSystemNotification(
    "appointment",
    "Appointment cancelled!",
    `Appointment ${appointment._id} has been cancelled for some reason!`,
    "doctor",
    appointment.doctor,
    appointment
  );
  return true;
};
