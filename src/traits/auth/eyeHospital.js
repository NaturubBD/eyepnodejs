const { default: axios } = require("axios");
const Patient = require("../../model/Patient");

exports.syncEyeHospitalPatient = async (phone) => {
  let records = await axios
    .get(`http://203.188.245.58:7011/api/beh/get-patient?contact_no=0${phone}`)
    .then((response) => {
      console.log("Patient data: ", response?.data?.patient_data);
      return response?.data?.patient_data;
    })
    .catch((error) => {
      // console.error("Error:", error.message);
      console.error(error.response.data)

      return [];
    });

  let mainAccount = await Patient.findOne({ phone });
  let count = 0;
  for (const record of records) {
    count++;

    if (count == 1 && mainAccount) {
      await Patient.findByIdAndUpdate(mainAccount._id, {
        eyeHospitalPID: record?.reg_no,
      });
    } else {
      await Patient.create({
        eyeHospitalPID: record?.reg_no,
        name: record.pat_name,
        gender: record.sex?.toLowerCase(),
        dateOfBirth: new Date("05/05/1981"),
        parent: mainAccount?._id,
        ...(count == 1 &&
          !mainAccount && {
            phone,
            dialCode: "+880",
          }),
        patientType: count == 1 && !mainAccount ? "main" : "relative",
      });
    }
  }

  return records;
};

exports.pushPatientToEyeHospital = async (body) => {
  console.log("Body: ", body);

  let info = await axios
    .post("http://203.188.245.58:7011/api/beh/create-patient", {
      registration_no: "",
      input_json: JSON.stringify({
        patient_reg: [
          {
            registration_id: "",
            patient_type: "General",
            patient_name: "Ferdous Kausar",
            registration_date: "26/10/2023 10:30:00 am",
            active_status: "Y",
            patient_presentaddress: "Dhaka",
            contact_number: "01747022189",
            date_birth: "05/05/1981",
            sex: "M",
          },
        ],
      }),
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
    });

  return 6;
};
