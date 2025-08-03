const PaymentAccountController = require("../../../controller/doctor/PaymentAccountController");
const PaymentAccountValidator = require("../../../validator/doctor/PaymentAccountValidator");

const paymentAccountRouter = require("express").Router();
require("express-group-routes");
paymentAccountRouter.group("/paymentAccount", (paymentAccount) => {
  paymentAccount.get("/", PaymentAccountController.list);
  paymentAccount.get("/:id", PaymentAccountController.detail);
  paymentAccount.post(
    "/",
    PaymentAccountValidator.create,
    PaymentAccountController.create
  );
  paymentAccount.patch(
    "/",
    PaymentAccountValidator.update,
    PaymentAccountController.update
  );
  paymentAccount.delete(
    "/:id",
    PaymentAccountValidator.delete,
    PaymentAccountController.delete
  );
});
module.exports = paymentAccountRouter;
