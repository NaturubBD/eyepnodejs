const Appointment = require("../model/Appointment");

const {
  RtcTokenBuilder,
  RtmTokenBuilder,
  RtcRole,
  RtmRole,
} = require("../../src/library/agora/index");
exports.initializeCallSession = async (appointment) => {
  const agoraAppID = process.env.AGORA_APP_ID || "";
  const agoraAppCertificate = process.env.AGORA_CERTIFICATE || "";
  const expirationTimeInSeconds = 3600; // Token expiration time in seconds
  if (typeof appointment != "object") {
    appointment = await Appointment.findById(appointment);
  }
  const privilegeExpiredTs =
    Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

  // Build Doctor token with uid
  const doctorToken = await RtcTokenBuilder.buildTokenWithUid(
    agoraAppID,
    agoraAppCertificate,
    appointment._id, //channelId
    appointment.doctor,
    RtcRole.PUBLISHER,
    privilegeExpiredTs
  );

  // Build Patient token with uid
  const patientToken = await RtcTokenBuilder.buildTokenWithUid(
    agoraAppID,
    agoraAppCertificate,
    appointment._id, //channelId
    appointment.patient,
    RtcRole.SUBSCRIBER,
    privilegeExpiredTs
  );

  await Appointment.findByIdAndUpdate(appointment._id, {
    doctorAgoraToken: doctorToken,
    patientAgoraToken: patientToken,
  });
  console.log("Done");

  return true;
};
