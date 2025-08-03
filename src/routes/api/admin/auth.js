const otpVerified = require("../../../middleware/otpVerified");
const authValidator = require("../../../validator/admin/authValidator");
const AuthController = require("../../../controller/admin/AuthController");
const AdminAuthenticated = require("../../../middleware/admin/AdminAuthenticated");

const authRouter = require("express").Router();
require("express-group-routes");

authRouter.group("/auth", (auth) => {
  auth.post(
    "/request",
    authValidator.authValidation,
    AuthController.authRequest
  );
  auth.post("/verifyAuth", otpVerified, AuthController.verifyAuth);
});

authRouter.delete("/auth/logout", AdminAuthenticated, AuthController.logout);

module.exports = authRouter;
