const Validator = require("Validator");
const { first } = require("underscore");
const AppError = require("../exception/AppError");

function validateMongoId(name, value) {
  let hexadecimal = /^[0-9A-F]+$/i;
  return typeof value === "string" && value.length === 24 && hexadecimal.test(value);
}

function validateMongoIdArray(name, value) {
  let hexadecimal = /^[0-9A-F]+$/i;
  if (!Array.isArray(value)) return false;
  return value.every(id => typeof id === "string" && id.length === 24 && hexadecimal.test(id));
}

function greaterThan(name, value, params) {
  let requirement = params[0];
  return Number(value) > Number(requirement);
}

function maxLength(name, value, params) {
  let requirement = params[0];
  return Number(value.length) <= Number(requirement);
}

function arrayType(name, value, params) {
  return Array.isArray(value);
}

function simpleValidator(data, rules) {
  const v = Validator.make(data, rules);

  v.extend("mongoid", validateMongoId, ":attr is not a valid object id");
  v.extend("mongoidarray", validateMongoIdArray, ":attr contains invalid object ids");
  v.extend("array", arrayType, ":attr is not a valid array");
  v.extend("gt", greaterThan, ":attr should be greater than the current value");
  v.extend("maxlength", maxLength, ":attr length should be less than the current");

  if (v.fails()) {
    let errors = v.getErrors();
    let firstKey = Object.keys(errors)[0];
    let firstError = first(errors[firstKey]);
    throw new AppError(firstError, 422, errors);
  }
  return true;
}

module.exports = simpleValidator;
