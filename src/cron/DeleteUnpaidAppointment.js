var cron = require("node-cron");
const moment = require("moment");
const Appointment = require("../model/Appointment");
// Every 30 seconds

module.exports = cron.schedule("59 * * * * *", async () => {
  // console.log("Bot: REMOVE_UNPAID_APPOINTMENT. Executing at: " + new Date().toDateString());
  let appointments = await Appointment.deleteMany({
    $or: [
      {
        status: "waitingForPayment",
        appointmentType: "regular",
        date: {
          $lt: moment.subtract(1, "hour").toDate(),
          // $lt: moment.utc().subtract(1, "hour").toDate(),
        },
      },
      {
        status: "waitingForPayment",
        appointmentType: "followUp",
        followUpDate: {
          // $lt: moment.utc().subtract(1, "day").toDate(),
          $lt: moment.subtract(1, "day").toDate(),
        },
      },
    ],
  });
});
