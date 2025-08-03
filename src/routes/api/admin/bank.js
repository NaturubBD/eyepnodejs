const BankController = require("../../../controller/admin/BankController");
const bankValidator = require("../../../validator/admin/bankValidator");

const bankRouter = require("express").Router();
require("express-group-routes");
bankRouter.group("/bank", (bank) => {
  bank.get("/", BankController.list);
  bank.get("/:id", BankController.detail);
  bank.post("/", bankValidator.create, BankController.create);
  bank.patch("/", bankValidator.update, BankController.update);
  bank.delete("/:id", bankValidator.delete, BankController.delete);
});
module.exports = bankRouter;
