const TestResultController = require("../../../controller/patient/TestResultController");
const testResultValidator = require("../../../validator/patient/testResultValidator");

const testResultRouter = require("express").Router();
require("express-group-routes");
testResultRouter.group("/testResult", (testResult) => {
  testResult.get("/clinical", TestResultController.list);
  testResult.get("/app", TestResultController.appTestList);
  testResult.post("/updateAppTest", TestResultController.updateAppTestResult);
  testResult.post(
    "/storeClinical",
    testResultValidator.create,
    TestResultController.create
  );
  testResult.patch(
    "/updateClinical",
    testResultValidator.update,
    TestResultController.update
  );
  testResult.delete(
    "/clinical/:id",
    testResultValidator.delete,
    TestResultController.delete
  );
});
module.exports = testResultRouter;
