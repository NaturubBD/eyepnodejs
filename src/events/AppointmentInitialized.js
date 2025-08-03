const Appointment = require("../model/Appointment");
const { sendSystemNotification } = require("../traits/NotificationService");

module.exports = async (appointmentId) => {
  // let appointment = await Appointment.findById(appointmentId)
  //   .populate("doctor")
  //   .populate("patient");
  // await sendSystemNotification(
  //   "appointment",
  //   "Payment completed successfully!",
  //   `Payment of appointment ${appointment._id} via ${appointment.paymentMethod} completed successfully`,
  //   "patient",
  //   appointment.patient,
  //   appointment
  // );
  return true;
};
