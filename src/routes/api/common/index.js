const CommonController = require("../../../controller/CommonController");
const { resendOtp } = require("../../../controller/otpController");
const AppointmentController = require("../../../controller/patient/AppointmentController");

const commonRouter = require("express").Router();
require("express-group-routes");
commonRouter.group("/common", (common) => {
  common.get("/specialties", CommonController.specialtiesList);
  common.get("/hospitalList", CommonController.hospitalList);
  common.get("/districtList", CommonController.districtList);
  common.get("/getHospitalNearMe", CommonController.getHospitalNearMe);
  common.post("/resendOtp", resendOtp);

  common.get("/getDoctorByPhone/:phone", CommonController.getDoctorByPhone);
  common.get(
    "/getPaymentAccountsByDoctor/:id",
    CommonController.getPaymentAccountsByDoctor
  );
  common.get("/getAppointmentReason", CommonController.getAppointmentReason);
  common.get("/banners", CommonController.banners);
  common.get("/banks", CommonController.banks);
  common.get("/doctorPublicProfile/:id", CommonController.doctorPublicProfile);


  common.post("/upload", CommonController.upload);


  common.all(
    "/payment-success/:id",
    AppointmentController.handlePaymentSuccess
  );
  common.all(
    "/payment-failed/:id",
    AppointmentController.handlePaymentFailed
  );
  common.all(
    "/payment-cancel/:id",
    AppointmentController.handlePaymentCancel
  );

});
module.exports = commonRouter;
