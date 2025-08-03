module.exports = (amount, from = "USD", to = "BDT") => {
  let usd_to_bdt_rate = 109;
  return amount * usd_to_bdt_rate;
};
