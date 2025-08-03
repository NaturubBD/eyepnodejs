const { v4 } = require("uuid");
const OtpVerification = require("../../model/OtpVerification");
const axios = require("axios");

const TEST_PHONE = "+8801800000000";
const TEST_OTP = 123456;

exports.createOtp = async (
  userId,
  criteria,
  via,
  fullPhone,
  email,
  data = {}
) => {
  const traceId = v4();

  // Force specific OTP for a test number
  let code = fullPhone === TEST_PHONE ? TEST_OTP : Math.floor(100000 + Math.random() * 900000);

  console.log("OTP Code:", code);

  const verification = await OtpVerification.create({
    user: userId,
    traceId,
    phoneWithDialCode: fullPhone,
    email,
    code,
    criteria,
    data,
    via,
  });

  // Send OTP via SMS
  if (via === "sms" && fullPhone) {
    try {
      await axios.post(process.env.SMS_API_URL, {
        api_token: process.env.SMS_API_TOKEN,
        sid: process.env.SMS_SID,
        msisdn: fullPhone,
        sms: `Your OTP is ${code}`,
        csms_id: traceId
      });
    } catch (error) {
      console.error("SMS sending failed:", error.response?.data || error.message);
    }
  }

  return verification;
};

exports.resendOtp = async (traceId) => {
  const verification = await OtpVerification.findById(traceId);
  if (!verification) throw new Error("OTP trace not found");

  // Force same OTP if test number
  const code = verification.phoneWithDialCode === TEST_PHONE
    ? TEST_OTP
    : Math.floor(100000 + Math.random() * 900000);

  verification.code = code;
  await verification.save();

  // Resend via SMS
  if (verification.phoneWithDialCode) {
    try {
      await axios.post(process.env.SMS_API_URL, {
        api_token: process.env.SMS_API_TOKEN,
        sid: process.env.SMS_SID,
        msisdn: verification.phoneWithDialCode,
        sms: `Your OTP is ${code}`,
        csms_id: traceId
      });
    } catch (error) {
      console.error("SMS resending failed:", error.response?.data || error.message);
    }
  }

  return verification;
};






// const { v4 } = require("uuid");
// const OtpVerification = require("../../model/OtpVerification");
// const axios = require("axios");



// exports.createOtp = async (
//   userId,
//   criteria,
//   via,
//   fullPhone,
//   email,
//   data = {}
// ) => {
//   let traceId = v4();
//   let code = Math.floor(100000 + Math.random() * 900000);
//   printf("OTP Code: ", code);
//   // if (process.env.NODE_ENV == "dev") {
//   //   code = 123456;
//   // }
//   let verification = await OtpVerification.create({
//     user: userId,
//     traceId,
//     phoneWithDialCode: fullPhone,
//     email,
//     code,
//     criteria,
//     data,
//     via,
//   });

//   // Send OTP VIA SMS
//   if (via === "sms" && fullPhone) {
//     try {
//       await axios.post(process.env.SMS_API_URL, {
//         api_token: process.env.SMS_API_TOKEN,
//         sid: SMS_SID,
//         msisdn: fullPhone,
//         sms: `Your OTP is ${code}`,
//         csms_id: traceId
//       });
//     } catch (error) {
//       console.error("SMS sending failed:", error.response?.data || error.message);
//       // Consider how you want to handle SMS sending failures
//       // You might want to throw an error or handle it differently
//     }
//   }

//   return verification;
// };

// exports.resendOtp = async (traceId) => {
//   let code = Math.floor(100000 + Math.random() * 900000);
//   let verification = await OtpVerification.findByIdAndUpdate(traceId, {
//     code,
//   });

//   // Send OTP VIA SMS
//   if (verification && verification.phoneWithDialCode) {
//     try {
//       await axios.post(SMS_API_URL, {
//         api_token: SMS_API_TOKEN,
//         sid: SMS_SID,
//         msisdn: verification.phoneWithDialCode,
//         sms: `Your OTP is ${code}`,
//         csms_id: traceId
//       });
//     } catch (error) {
//       console.error("SMS resending failed:", error.response?.data || error.message);
//       // Consider how you want to handle SMS sending failures
//     }
//   }

//   return verification;
// };