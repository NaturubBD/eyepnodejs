const { uploadFileToS3FromBuffer } = require("../../config/FileUpload");
const catchAsync = require("../../exception/catchAsync");
const Admin = require("../../model/Admin");

exports.me = catchAsync(async (req, res) => {
  let user = req.user;
  res.json({
    status: "success",
    message: "Fetched successfully",
    user,
  });
});

exports.update = catchAsync(async (req, res) => {
  let { user } = req;
  let { name, email } = req.body;
  await Admin.findByIdAndUpdate(user._id, {
    name,
    email,
  });
  res.status(200).json({
    status: "success",
    message: "Updated successfully",
  });
});

exports.uploadProfilePhoto = catchAsync(async (req, res, next) => {
  let { user } = req;


   var uploaded_file = req.files[0] ?? null;
   if (!uploaded_file) {
     throw new AppError("Attachment is required", 422);
   }
   let bufferData = uploaded_file?.buffer;
   let extension = uploaded_file?.mimetype?.split("/")[1] ?? "png";
   let photo = await uploadFileToS3FromBuffer(
     bufferData,
     extension,
     "admin/profile"
   ).then((data) => {
     console.log("data", data);
     return data?.Key ?? "";
   });
  // const { base64String, fileExtension } = req.body;
  // let uploadInfo = await uploadFileToS3(
  //   base64String,
  //   fileExtension,
  //   "admin/profile"
  // ).catch((err) => {
  //   console.log(err.message);
  //   return next(new AppError(500, "Something went wrong"));
  // });

  // let photo = uploadInfo?.Key || "";
  await Admin.findByIdAndUpdate(user._id, {
    photo,
  });

  res.status(200).json({
    status: "success",
    message: "Uploaded successfully",
  });
});
