var cron = require("node-cron");

const moment = require("moment");
const Notification = require("../model/Notification");
const { notificationBroadcast } = require("../traits/NotificationService");
module.exports = cron.schedule("*/5 * * * * *", async () => {
  // console.log(
  //   "Bot: PUSH_SCHEDULED_NOTIFICATION. Executing at: " +
  //     new Date().toDateString()
  // );

  let notifications = await Notification.find({
    audience: "all",
    status: "scheduled",
    scheduledAt: {
      $lte: moment.utc().toDate(),
    },
  });

  for (const notification of notifications) {
    await notificationBroadcast(notification)
  }
});
