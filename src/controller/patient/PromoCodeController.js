const AppError = require("../../exception/AppError");
const catchAsync = require("../../exception/catchAsync");
const Appointment = require("../../model/Appointment");
const Promo = require("../../model/Promo");
const TestResult = require("../../model/TestResult");
const { checkPromoAvailability } = require("../../traits/PromoService");
const simpleValidator = require("../../validator/simpleValidator");
exports.getPromos = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let user = req.user;
  let aggregatedQuery = Promo.aggregate([
    {
      $match: {
        $or: [{ selectedUsers: { $in: [user.phone] } }, { discountFor: "all" }],
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
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let data = await Promo.aggregatePaginate(aggregatedQuery, options);
  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
exports.checkAvailability = catchAsync(async (req, res) => {
  let info = await checkPromoAvailability(code, req.user);
  if (!info) {
    throw new AppError(`${code} promo is not available at this moment`, 422);
  }

  res.json({
    status: "success",
    message: "Fetched successfully",
    data: info,
  });
});

exports.applyPromo = catchAsync(async (req, res) => {
  await simpleValidator(req.body, {
    code: "required",
    appointment: "required|mongoid",
  });
  let { code, appointment } = req.body;
  let promoInfo = await checkPromoAvailability(code, req.user);
  if (!promoInfo) {
    throw new AppError(`${code} promo is not available at this moment`, 422);
  }

  let appointmentInfo = await Appointment.findById(appointment);
  if (appointmentInfo.status != "waitingForPayment") {
    throw new AppError(`Unable to apply promo code`, 422);
  }
  let {
    fee,
    vat,
    discount,
    grandTotal,
    totalAmount,
    usdVat,
    usdDiscount,
    usdGrandTotal,
    usdTotalAmount,
  } = appointmentInfo;
  if (promoInfo?.minimumPurchase && promoInfo.minimumPurchase > totalAmount) {
    throw new AppError(
      `You have to spend minimum ${promoInfo.minimumPurchase} to apply ${code} `,
      422
    );
  }
  discount = totalAmount * (promoInfo.discount / 100);
  if (promoInfo.maximumDiscount && discount > promoInfo.maximumDiscount) {
    discount = promoInfo.maximumDiscount;
  }

  usdDiscount = usdTotalAmount * (promoInfo.discount / 100);
  if (promoInfo.maximumDiscount && usdDiscount > promoInfo.maximumDiscount) {
    usdDiscount = promoInfo.maximumDiscount;
  }

  grandTotal = totalAmount + vat + fee - discount;
  usdGrandTotal = usdTotalAmount + usdVat - usdDiscount;

  appointmentInfo = await Appointment.findByIdAndUpdate(
    appointment,
    {
      fee,
      vat,
      discount,
      grandTotal,
      usdVat,
      usdDiscount,
      usdGrandTotal,
      usdTotalAmount,
      promoCode: code,
    },
    { new: true }
  );

  res.json({
    status: "success",
    message: "Applied successfully!",
    data: appointmentInfo,
  });
});
