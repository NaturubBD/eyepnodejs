const moment = require("moment");
const catchAsync = require("../../exception/catchAsync");
const Notification = require("../../model/Notification");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const { pluck } = require("underscore");

exports.list = catchAsync(async (req, res) => {
  let page = req.query.page || 1;
  let limit = req.query.limit || 10;
  let dateFrom = req.query.dateFrom || null;
  let dateTo = req.query.dateTo || null;
  let user = req.user;
  let patients = req.patients;

  let dateQuery = dateQueryGenerator(dateFrom, dateTo);
  let aggregatedQuery = Notification.aggregate([
    {
      $match: {
        ...dateQuery,
        status: "sent",
        $or: [
          {
            audience: "all",
          },
          {
            audience: "patient",
            audienceId: { $in: pluck(patients, "_id") },
          },
        ],
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $project: {
        _id: 1,
        title: 1,
        body: 1,
        criteria: 1,
        type: 1,
        metaData: 1,
        createdAt: 1,
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
  let data = await Notification.aggregatePaginate(aggregatedQuery, options);

  res.json({
    status: "success",
    message: "Fetched successfully",
    data,
  });
});
