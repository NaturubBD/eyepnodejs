const Doctor = require("../model/Doctor");
const Notification = require("../model/Notification");
const Patient = require("../model/Patient");

exports.notificationBroadcast = async (notification) => {
  // console.log("Broadcasting", notification._id);
  await Notification.findByIdAndUpdate(notification._id, {
    status: "sent",
  });

  // Broadcast
  const topic = "all"; // Specify the topic to which you want to send the notification
  const message = {
    notification: {
      title: notification.title,
      body: notification.body,
      // icon: "firebase-logo.png",
    },

    data: {
      meta: JSON.stringify(notification),

      title: notification.title,
      body: notification.body,
    },
    topic: topic,
  };
  return firebase
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Notification sent successfully:", response);
      return true;
    })
    .catch((error) => {
      console.error("Error sending notification:", error);
      return false;
    });
};

exports.sendSystemNotification = async (
  criteria,
  title,
  body,
  audience = "patient",
  audienceId = null,
  metaData = {}
) => {
  let notification = await Notification.create({
    criteria,
    title,
    body,
    audience,
    audienceId,
    metaData,
    status: "sent",
  });
  // console.log("notifying");
  if (audienceId) {
    let registrationTokens = [];
    if (audience == "patient") {
      let patient = await Patient.findById(audienceId).lean();
      if (patient.patientType == "relative") {
        patient = await Patient.findById(patient.parent).lean();
      }
      registrationTokens = patient?.deviceTokens ?? [];

      console.log("tokrns", registrationTokens);
    } else if (audience == "doctor") {
      let doctor = await Doctor.findById(audienceId).lean();
      registrationTokens = doctor?.deviceTokens ?? [];
    }

    const message = {
      notification: {
        title,
        body,
      },
      data: {
        meta: JSON.stringify(notification),
        title,
        body,
      },
    };
    // const sendNotification = await Promise.all(async (token) => {});

    // await registrationTokens.forEach(sendNotification);

    registrationTokens.forEach((token) => {
      console.log("message", { ...message });
      try {
        firebase
          .messaging()
          .send({ ...message, token })
          .then((response) => {
            console.log("Notification sent successfully:", response);
            return true;
          })
          .catch((error) => {
            console.error("Error sending notification:", error);
            return false;
          });
      } catch (error) {
        console.log("Firebase error:", error.message);
      }
    });
  }
  return notification;
};
