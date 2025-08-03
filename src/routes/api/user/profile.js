const profileController = require("../../../controller/profileController");
const PatientAuthenticated = require("../../../middleware/PatientAuthenticated");
const { profileUpdateValidation } = require("../../../validator/profileValidator");

const profileRouter = require("express").Router();
require("express-group-routes");

profileRouter.group("/profile", (profile) => {
  profile.use(PatientAuthenticated);
  profile.get("/me", profileController.info);
  profile.patch("/update", profileUpdateValidation, profileController.update);
});
module.exports = profileRouter;
