var cron = require("node-cron");
const Appointment = require("../model/Appointment");
const moment = require("moment");
const { sendSystemNotification } = require("../traits/NotificationService");
module.exports = cron.schedule("59 * * * * *", async () => {
  // console.log("Bot: NOTIFY_FOLLOWUP");
  let appointments = await Appointment.find({
    status: "waitingForPayment",
    appointmentType: "followUp",
    date: {
      $lte: moment.utc().add(6, "hours").toDate(),
    },
    notifiedForFollowUp: {
      $ne: true,
    },
  })
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");
  for (const appointment of appointments) {
    await sendSystemNotification(
      "followUpAppointment",
      `Scheduled follow up appointment`,
      `You are closer to a follow up appointment with ${
        appointment.doctor.name || ""
      }. Please do confirm your follow up appointment`,
      "patient",
      appointment.patient,
      appointment
    );

    await Appointment.findByIdAndUpdate(appointment._id, {
      notifiedForFollowUp: true,
    });
  }
});
