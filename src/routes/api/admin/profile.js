const ProfileController = require("../../../controller/admin/ProfileController");

const profileRouter = require("express").Router();
require("express-group-routes");

profileRouter.group("/profile", (profile) => {
  profile.get("/", ProfileController.me);
  profile.post("/uploadProfilePhoto", ProfileController.uploadProfilePhoto);
  profile.patch("/update", ProfileController.update);
});

module.exports = profileRouter;
