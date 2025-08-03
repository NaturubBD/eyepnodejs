const { Types } = require("mongoose");
const Doctor = require("../../model/Doctor");
const dateQueryGenerator = require("../../utils/dateQueryGenerator");
const {
  foreignerConsultationFeeInUsd,
  foreignerFollowUpFeeInUsd,
} = require("../../utils/constant");

exports.getDoctorList = async (filterOptions, patientInfo = {}) => {
  let page = filterOptions.page || 1;
  let limit = filterOptions.limit || 10;
  let ids = filterOptions.ids || null;
  let _id = filterOptions?._id ? Types.ObjectId(filterOptions._id) : null;
  let dateFrom = filterOptions.dateFrom || null;
  let dateTo = filterOptions.dateTo || null;
  let query = filterOptions.query || null;
  let status = filterOptions.status || null;
  let minConsultationFee = filterOptions.minConsultationFee || 0;
  let maxConsultationFee = filterOptions.maxConsultationFee || 0;
  let minRating = filterOptions.minRating || 0;
  let specialty = filterOptions.specialty || null;
  let availabilityStatus = filterOptions.availabilityStatus || null;

  let dateQuery = dateQueryGenerator(dateFrom, dateTo);

  let aggregatedQuery = Doctor.aggregate([
    {
      $lookup: {
        from: "hospitals",
        localField: "hospital",
        foreignField: "_id",
        as: "hospital",
      },
    },
    {
      $unwind: {
        path: "$hospital",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "specialties",
        localField: "specialty",
        foreignField: "_id",
        as: "specialty",
      },
    },
    {
      $unwind: {
        path: "$specialty",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "experiences",
        localField: "_id",
        foreignField: "doctor",
        as: "experiences",
      },
    },
    {
      $match: {
        ...(_id && { _id }),
        ...(specialty && { "specialty._id": Types.ObjectId(specialty) }),
        ...(ids && { _id: { $in: ids } }),
        ...dateQuery,
        ...(query && {
          $or: [
            { name: new RegExp(query, "i") },
            { phone: new RegExp(query, "i") },
            { _id: new RegExp(query, "i") },
          ],
        }),
        ...(status && { status }),
        ...(availabilityStatus && { availabilityStatus }),

        ...(minConsultationFee && {
          consultationFee: { $gte: Number(minConsultationFee) },
        }),
        ...(maxConsultationFee && {
          consultationFee: { $lte: Number(maxConsultationFee) },
        }),
        ...(minRating && {
          averageRating: { $gte: Number(minRating) },
        }),
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },

    // {
    //   $project: {
    //     name: 1,
    //     dialCode: 1,
    //     phone: 1,
    //     photo: 1,
    //     specialty: {
    //       title: 1,
    //       symptoms: 1,
    //     },
    //     hospital: {
    //       name: 1,
    //       address: 1,
    //       latitude: 1,
    //       longitude: 1,
    //       description: 1,
    //       banner: 1,
    //     },
    //     experiences: {
    //       hospitalName: 1,
    //       designation: 1,
    //       department: 1,
    //       startDate: 1,
    //       endDate: 1,
    //       currentlyWorkingHere: 1,
    //     },
    //     gender: 1,
    //     experienceInYear: 1,
    //     bmdcCode: 1,
    //     consultationFee: 1,
    //     followupFee: 1,
    //     about: 1,
    //     status: 1,
    //     availabilityStatus: 1,
    //     ratingCount: 1,
    //     averageRating: 1,
    //     averageConsultancyTime: 1,
    //     averageResponseTime: 1,
    //     totalConsultationCount: 1,
    //   },
    // },
  ]);

  let options = {
    page,
    limit,
  };
  if (limit === -1) {
    options.limit = 100000000000;
  }
  let records = await Doctor.aggregatePaginate(aggregatedQuery, options);

  if (Object.keys(patientInfo).length > 0) {
    let favoriteDoctors = patientInfo.favoriteDoctors || [];
    let docs = records.docs.map((i) => {
      return {
        ...i,
        isFavorite: favoriteDoctors.indexOf(i._id) != -1 ? true : false,
        consultationFeeUsd: foreignerConsultationFeeInUsd,
        followUpFeeUsd: foreignerFollowUpFeeInUsd,
      };
    });
    records = {
      ...records,
      docs,
    };
  }

  return records;
};

exports.getSingleDoctor = async (id) => {
  let data = await this.getDoctorList({ _id: id });

  return data?.docs[0] ?? null;
};
