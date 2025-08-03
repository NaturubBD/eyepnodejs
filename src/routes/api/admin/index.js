const AdminAuthenticated = require("../../../middleware/admin/AdminAuthenticated");
const appointmentRouter = require("./appointment");
const appointmentReasonRouter = require("./appointmentReason");
const authRouter = require("./auth");
const bankRouter = require("./bank");
const bannerRouter = require("./banner");
const dashboardRouter = require("./dasboard");
const doctorRouter = require("./doctor");
const hospitalRouter = require("./hospital");
const notificationRouter = require("./notification");
const patientRouter = require("./patient");
const profileRouter = require("./profile");
const profitRouter = require("./profit");
const promoRouter = require("./promo");
const specialtyRouter = require("./specialty");
const subAdminRouter = require("./subAdmin");
const supportRouter = require("./support");
const walletRouter = require("./wallet");
const withdrawRouter = require("./withdraw");

const adminRouter = require("express").Router();
require("express-group-routes");

adminRouter.group("/admin", (auth) => {
  auth.use(authRouter);
});
adminRouter.group("/admin", (admin) => {
  admin.use(AdminAuthenticated);
  admin.use(profileRouter);
  admin.use(promoRouter);
  admin.use(hospitalRouter);
  admin.use(specialtyRouter);
  admin.use(patientRouter);
  admin.use(doctorRouter);
  admin.use(subAdminRouter);
  admin.use(appointmentRouter);
  admin.use(withdrawRouter);
  admin.use(notificationRouter);
  admin.use(walletRouter);
  admin.use(bannerRouter);
  admin.use(appointmentReasonRouter);
  admin.use(bankRouter);
  admin.use(supportRouter);
  admin.use(profitRouter)
  admin.use(dashboardRouter)
});

module.exports = adminRouter;
