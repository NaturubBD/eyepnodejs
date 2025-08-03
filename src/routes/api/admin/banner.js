const BannerController = require("../../../controller/admin/BannerController");
const bannerValidator = require("../../../validator/admin/bannerValidator");

const bannerRouter = require("express").Router();
require("express-group-routes");
bannerRouter.group("/banner", (profile) => {
  profile.get("/", BannerController.list);
  profile.post("/", bannerValidator.create, BannerController.create);
  profile.patch("/", bannerValidator.update, BannerController.update);
  profile.delete("/:id", bannerValidator.delete, BannerController.delete);
});
module.exports = bannerRouter;
