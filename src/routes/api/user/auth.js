const { register } = require("../../../controller/auth/registerController");
const PatientAuthenticated = require("../../../middleware/PatientAuthenticated");
const authValidator = require("../../../validator/authValidator");
const { login, logout, verifyLogin } = require("../../../controller/auth/loginController");
const registerController = require("../../../controller/auth/registerController");
const otpController = require("../../../controller/otpController");
const otpVerified = require("../../../middleware/otpVerified");

const authRouter = require("express").Router();
require("express-group-routes");

authRouter.group("/auth", (auth) => {
  auth.post(
    "/register",
    authValidator.registerValidation,
    registerController.register
  );
  auth.post("/verifyRegister", otpVerified, registerController.verifyRegister);
  auth.post("/resendOtp", otpController.resendOtp);
  auth.post("/login", authValidator.loginValidation, login);
  auth.post("/verifyLogin", otpVerified, verifyLogin);
});

authRouter.delete("/auth/logout", PatientAuthenticated, logout);

module.exports = authRouter;
