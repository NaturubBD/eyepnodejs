const { default: axios } = require("axios");

const SSLCommerzPayment = require("sslcommerz-lts");

// const store_id = "dhanmondibdeyehospital0live";
// const store_passwd = "656D6CF93979B87667";
// const is_live = true; //true for live, false for sandbox

const store_id = "bangl66420b7b2596c";
const store_passwd = "bangl66420b7b2596c@ssl";
const is_live = false; //true for live, false for sandbox

exports.initiateSSLCommerzPayment = async (appointment) => {
  console.log(
    `${appointment?.patient?.dialCode} ${appointment?.patient?.phone}`
  );
  const data = {
    total_amount: appointment?.grandTotal,
    currency: "BDT",
    tran_id: appointment._id.toString(), // use unique tran_id for each api call
    success_url: `${process.env.API_URL}/api/common/payment-success/${appointment._id}`,
    fail_url: `${process.env.API_URL}/api/common/payment-failed/${appointment._id}`,
    cancel_url: `${process.env.API_URL}/api/common/payment-cancel/${appointment._id}`,
    ipn_url: `${process.env.API_URL}/webhook/ssl-commerz-payment-ipn-handler`,
    shipping_method: "Online",
    product_name: `Appointment with ${appointment?.doctor?.name}`,
    product_category: "Teleophthalmology",
    product_profile: "general",
    cus_name: `${appointment?.patient?.name}`,
    cus_email: `0${appointment?.patient?.phone}@gmail.com`,
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: `0${appointment?.patient?.phone}`,
    cus_fax: `0${appointment?.patient?.phone}`,
    ship_name: `${appointment?.patient?.name}`,
    ship_add1: "Dhaka",
    ship_add2: "Dhaka",
    ship_city: "Dhaka",
    ship_state: "Dhaka",
    ship_postcode: 1000,
    ship_country: "Bangladesh",
  };

  console.log("data", data);
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  let url = await sslcz.init(data).then((apiResponse) => {
    // Redirect the user to payment gateway
    console.log("apiResponse", apiResponse);
    let GatewayPageURL = apiResponse.GatewayPageURL;
    // res.redirect(GatewayPageURL);
    console.log("Redirecting to: ", GatewayPageURL);
    return GatewayPageURL;
  }).catch((error) => { 
    console.log("Error: ", error.message);
    return null
  });
  return url;
};
