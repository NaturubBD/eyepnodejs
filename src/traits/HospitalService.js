const Hospital = require("../model/Hospital");

exports.getNearbyHospital = async (
  longitude,
  latitude,
  filterOptions = {},
  radiusInKM = 50
) => {
  let page = filterOptions.page || 1;
  let limit = filterOptions.limit || 10;

  let aggregatedQuery = Hospital.aggregate([
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(longitude), parseFloat(latitude)],
        },
        distanceField: "distance",
        maxDistance: radiusInKM * 1000,
        distanceMultiplier: 1 / 1000,
      },
    },
    {
      $match: {
        status: "active",
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
  let records = await Hospital.aggregatePaginate(aggregatedQuery, options);

  return records;
};
