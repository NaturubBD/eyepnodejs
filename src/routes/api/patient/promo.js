const PromoCodeController = require("../../../controller/patient/PromoCodeController");
const promoRouter = require("express").Router();
require("express-group-routes");
promoRouter.group("/promo", (promo) => {
  promo.get("/getPromos", PromoCodeController.getPromos);
  promo.get("/checkAvailability", PromoCodeController.checkAvailability);
  promo.post("/applyPromo", PromoCodeController.applyPromo);
});
module.exports = promoRouter;
