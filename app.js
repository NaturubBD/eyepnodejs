const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./src/config/db");
require("./src/cron/index.js");
const body_parser = require("body-parser");
var multer = require("multer");
var multipart = multer();

let app = express();
app.use(cors());
app.use(body_parser.urlencoded({ extended: true, limit: "50mb" }));
app.use(body_parser.json({ extended: true, limit: "50mb" }));

// for parsing multipart/form-data
app.use(multipart.array("attachment"));
app.use(express.static("public"));

const router = require("./src/routes/http");
const AppError = require("./src/exception/AppError");
const globalError = require("./src/exception/globalError");
const firebase = require("./src/config/firebase");
firebase();
app.all("*", (req, res, next) => {
  console.log(` ${new Date()} ${req.originalUrl}`);
  next();
});
app.use(router);
app.get("/", (req, res) => {
  res.json({
    message: "Server is on 🔥",
  });
});
app.all("*", (req, res, next) => {
  next(
    new AppError(`Can't find route ${req.originalUrl} on this Node server`, 404)
  );
});
app.use(globalError);
module.exports = app;
