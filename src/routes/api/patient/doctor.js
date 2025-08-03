const DoctorController = require("../../../controller/patient/DoctorController");
const patientValidator = require("../../../validator/patient/patientValidator");

const doctorRouter = require("express").Router();
require("express-group-routes");
doctorRouter.group("/doctor", (profile) => {
  profile.get("/", DoctorController.getList);
  profile.get("/info/:id", DoctorController.getInfo);
  profile.get("/favorites", DoctorController.getFavoriteList);
  profile.post("/addToFavorite/:id", DoctorController.addFavorite);
  profile.delete("/removeFromFavorite/:id", DoctorController.removeFavorite);
});
module.exports = doctorRouter;
