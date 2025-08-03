const DoctorAuthenticated = require("../../../middleware/doctor/DoctorAuthenticated");
const authValidator = require("../../../validator/doctor/authValidator");
const AuthController = require("../../../controller/doctor/AuthController");
const otpVerified = require("../../../middleware/otpVerified");

const authRouter = require("express").Router();
require("express-group-routes");

authRouter.group("/auth", (auth) => {
  auth.post(
    "/request",
    authValidator.authValidation,
    AuthController.authRequest
  );
  auth.post("/verifyAuth", otpVerified, AuthController.verifyAuth);
  auth.post("/updateInformation", DoctorAuthenticated,authValidator.updateInformation, AuthController.updateInformation);
});

authRouter.delete("/auth/logout", DoctorAuthenticated, AuthController.logout);

module.exports = authRouter;
