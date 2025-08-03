const ProfileController = require("../../../controller/doctor/ProfileController");
const otpVerified = require("../../../middleware/otpVerified");
const profileValidator = require("../../../validator/doctor/profileValidator");

const profileRouter = require("express").Router();
require("express-group-routes");

profileRouter.group("/profile", (profile) => {
  profile.get("/", ProfileController.me);
  profile.post(
    "/updateBasicProfile",
    profileValidator.basicInformationUpdate,
    ProfileController.updateBasicProfile
  );
  profile.post(
    "/updateConsultationFee",
    profileValidator.updateConsultationFee,
    ProfileController.updateConsultationFee
  );
  profile.post(
    "/updateExperience",
    profileValidator.updateExperience,
    ProfileController.updateExperience
  );
  profile.patch(
    "/updateAvailabilityStatus/:status",
    ProfileController.updateAvailabilityStatus
  );
  profile.post("/uploadProfilePhoto", ProfileController.uploadProfilePhoto);
  profile.post("/uploadSignature", ProfileController.uploadSignature);
});

profileRouter.group("/changePhone", (profile) => {
  profile.post("/request", ProfileController.phoneChangeRequest);
  profile.post("/verify", otpVerified, ProfileController.phoneChangeVerify);
});
module.exports = profileRouter;
