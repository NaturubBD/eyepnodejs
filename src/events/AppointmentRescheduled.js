const Appointment = require("../model/Appointment");
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
    "Appointment Rescheduled!",
    `Appointment ${appointment._id} has been re-scheduled due to high traffic! Stay connected`,
    "patient",
    appointment.patient,
    appointment
  );
  return true;
};
