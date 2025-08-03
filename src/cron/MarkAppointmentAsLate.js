var cron = require("node-cron");
const Appointment = require("../model/Appointment");

const moment = require("moment");
const { sendSystemNotification } = require("../traits/NotificationService");
module.exports = cron.schedule("59 * * * * *", async () => {
  console.log(
    "Bot: DETECT_LATE_APPOINTMENT. Executing at: " + new Date().toDateString()
  );
  let appointments = await Appointment.find({
    status: "queued",
    date: {
      $lt: moment.utc().subtract(2, "hour").toDate(),
    },
  })
    .populate(
      "doctor",
      "phone availabilityStatus about name photo ratingCount experienceInYear "
    )
    .populate("patient", " phone name patientType gender");
  
  console.log("Appointment count", appointments.length);

  for (const appointment of appointments) {

    console.log("into the loop", appointment._id)
    sendSystemNotification(
      "appointment",
      `Appointment delayed!`,
      `Your appointment with ${
        appointment.doctor.name || ":"
      } has been delayed! Please be patience`,
      "patient",
      appointment.patient,
      appointment
    );
    console.log("middle of loop")

    await Appointment.findByIdAndUpdate(appointment._id, {
      status: "late",
    });

    console.log("Loop finished")
  }
});
