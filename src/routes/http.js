const adminRouter = require("./api/admin");
const commonRouter = require("./api/common");
const doctorRouter = require("./api/doctor");
const patientRouter = require("./api/patient");
const temporaryRouter = require("./api/temporaryRouter");
const webhookRouter = require("./webhookRouter");

const router = require("express").Router();
require("express-group-routes");
router.group("/api", (api) => {
  api.use(adminRouter);
  api.use(doctorRouter);
  api.use(commonRouter);
  api.use(temporaryRouter);
  api.use(patientRouter);
  api.get("/", async (req, res) => {
    res.json({
      status: "Api server is running",
    });
  });
});
router.use(webhookRouter)

module.exports = router;
