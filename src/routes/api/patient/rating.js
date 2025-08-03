const RatingController = require("../../../controller/patient/RatingController");
const ratingValidator = require("../../../validator/patient/ratingValidator");
const ratingRouter = require("express").Router();
require("express-group-routes");
ratingRouter.group("/rating", (rating) => {
  rating.post(
    "/submit",
    ratingValidator.submitRatingValidator,
    RatingController.submitRating
  );
  rating.get("/getDoctorRating", RatingController.getDoctorRating);
});
module.exports = ratingRouter;
