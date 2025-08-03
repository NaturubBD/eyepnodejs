const Promo = require("../model/Promo");

exports.checkPromoAvailability = async (code, patient, appointment) => {
  let data = await Promo.findOne({
    code,
    $or: [{ selectedUsers: { $in: [patient.phone] } }, { discountFor: "all" }],
    $and: [
      {
        validFrom: {
          $lte: new Date(),
        },
      },
      {
        validTill: {
          $gte: new Date(),
        },
      },
    ],
  });
  return data;
};
