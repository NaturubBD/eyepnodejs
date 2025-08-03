const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (prescription, appointment) => {
  await sendSystemNotification(
    "prescription",
    "Prescription Submitted!",
    // `Prescription for ${prescription.appointment} has been has been submitted by the doctor`,
    `Prescription has been submitted by ${appointment?.doctor?.name}`,
    "patient",
    prescription.patient,
    prescription
  );


  io.to(appointment._id).emit("prescriptionUpdate", prescription);
  return true;
};
