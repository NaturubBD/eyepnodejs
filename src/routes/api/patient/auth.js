const PatientAuthenticated = require("../../../middleware/PatientAuthenticated");
const authValidator = require("../../../validator/patient/authValidator");
const otpController = require("../../../controller/otpController");
const otpVerified = require("../../../middleware/otpVerified");
const authController = require("../../../controller/patient/authController");

const authRouter = require("express").Router();
require("express-group-routes");

authRouter.group("/auth", (auth) => {
  // auth.post(
  //   "/register",
  //   authValidator.registerValidation,
  //   registerController.register
  // );
  // auth.post("/verifyRegister", otpVerified, registerController.verifyRegister);
  auth.post("/resendOtp", otpController.resendOtp);
  auth.post("/request", authValidator.authRequestValidator, authController.request);
  auth.post("/verifyAuth", otpVerified, authController.verifyAuth);
});

authRouter.delete("/auth/logout", PatientAuthenticated, authController.logout);

module.exports = authRouter;
