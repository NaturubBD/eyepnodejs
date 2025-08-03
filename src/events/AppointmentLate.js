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
    "Appointment delayed.",
    `Appointment #${appointment._id} has been delayed due to high traffic! Stay connected!`,
    "patient",
    appointment.patient,
    appointment
  );

  // Notify to doctor

  await sendSystemNotification(
    "appointment",
    "Appointment delayed.",
    `Appointment #${appointment._id} has been delayed! Please take a look`,
    "doctor",
    appointment.doctor,
    appointment
  );


  return true;
};
