const profileController = require("../../../controller/patient/profileController");
const PatientAuthenticated = require("../../../middleware/PatientAuthenticated");
const otpVerified = require("../../../middleware/otpVerified");
const {
  profileUpdateValidation,
} = require("../../../validator/patient/profileValidator");

const profileRouter = require("express").Router();
require("express-group-routes");

profileRouter.group("/profile", (profile) => {
  profile.use(PatientAuthenticated);
  profile.get("/me", profileController.info);
  profile.patch("/update", profileUpdateValidation, profileController.update);
  profile.post("/uploadProfilePhoto", profileController.uploadProfilePhoto);
});
profileRouter.group("/changePhone", (profile) => {
  profile.use(PatientAuthenticated);
  profile.post("/request", profileController.phoneChangeRequest);
  profile.post("/verify",otpVerified, profileController.phoneChangeVerify);
});
module.exports = profileRouter;
