var cron = require("node-cron");
const Appointment = require("../model/Appointment");
const moment = require("moment");
const { sendSystemNotification } = require("../traits/NotificationService");
// Every minutes
module.exports = cron.schedule("59 * * * * *", async () => {
  // console.log("Bot: NOTIFY_FOR_RATING");
  let appointments = await Appointment.find({
    status: "completed",
    date: {
      $lte: moment.utc().subtract(1, "hour").toDate(),
    },
    notifiedForRating: {
      $ne: true,
    },
  })
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");
  for (const appointment of appointments) {
    // console.log(appointment._id);
    await sendSystemNotification(
      "appointmentRating",
      `How was the doctor?`,
      `Please share your feedback on your appointment with doctor ${
        appointment.doctor.name || ""
      }`,
      "patient",
      appointment.patient,
      appointment
    );

    await Appointment.findByIdAndUpdate(appointment._id, {
      notifiedForRating: true,
    });
  }
});
