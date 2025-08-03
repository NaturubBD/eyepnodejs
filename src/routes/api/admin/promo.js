const PromoCodeController = require("../../../controller/admin/PromoCodeController");
const promoValidator = require("../../../validator/admin/promoValidator");

const promoRouter = require("express").Router();
require("express-group-routes");
promoRouter.group("/promo", (profile) => {
  profile.get("/", PromoCodeController.list);
  profile.post("/", promoValidator.create, PromoCodeController.create);
  profile.patch("/", promoValidator.update, PromoCodeController.update);
  profile.delete("/:id", promoValidator.delete, PromoCodeController.delete);
  profile.patch("/toggleStatus/:id", PromoCodeController.toggleStatus);
});
module.exports = promoRouter;
