const AppointmentDropped = require("../events/AppointmentDropped");
const AppError = require("../exception/AppError");
const Appointment = require("../model/Appointment");
const Webhook = require("../model/Webhook");
const { MarkAppointmentAsPaid } = require("../traits/AppointmentService");

exports.bkashWebhook = async (req, res) => {
  let data = req.body;
  Webhook.create({
    type: "bkash",
    data,
  });
  res.json({
    status: 200,
  });
};

exports.sslCommerzIpnWebhook = async (req, res) => {
  let data = req.body;
  Webhook.create({
    type: "sslcommerzIpnWebhook",
    data,
  });

  let {
    amount,
    tran_id,
    store_amount,
    store_id,
    val_id,
    tran_date,
    bank_tran_id,
    card_type,
  } = req.body;
  let appointment = await Appointment.findById(tran_id);

  if (appointment?.status == "waitingForPayment") {
    appointment = await MarkAppointmentAsPaid(
      appointment,
      bank_tran_id,
      card_type,
      req.body
    );
  } else {
    console.log(`This appointment is already ${appointment.status}`);
  }
  res.json({
    status: 200,
    amount,
    tran_id,
    store_amount,
    store_id,
    val_id,
    tran_date,
    appointment,
  });
};

exports.agoraWebhook = async (req, res) => {
  let data = req.body;
  console.log("agora", data);

  let { eventType, payload } = data;
  let appointmentId = payload?.channelName ?? null;
  if (eventType == 104 || eventType == 106) {
    console.log("Recipient leaved", appointmentId);
    // If broadcaster leave or audience leave
    let reason = Number(payload?.reason ?? 0);
    let duration = Number(payload?.duration ?? 0);
    let dropableReason = [2, 3, 4, 10, 999];

    //check if dropped
    if (dropableReason.indexOf(reason) !== -1) {
      console.log("About to drop appointment", appointmentId);
      let appointment = await Appointment.findOne({ _id: appointmentId })
        .populate("patient")
        .lean();
      if (!appointment) {
        throw new AppError("Id is not found", 422);
      }

      if (appointment.status != "queued") {
        throw new AppError(
          `Unable to mark a ${appointment.status} record`,
          422
        );
      }
      await Appointment.findByIdAndUpdate(appointmentId, {
        status: "dropped",
      });

      AppointmentDropped(appointmentId);
    }

    // Final update

    await Appointment.findByIdAndUpdate(appointmentId, {
      callDurationInSec: duration,
    });
  }

  res.json({
    status: 200,
  });
};
