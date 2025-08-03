require("dotenv").config();
const AppError = require("../exception/AppError");
class SMS {
  constructor(to) {
    if (!to) {
      throw new AppError(422, "Destination phone is required");
    }
    this.to = to;
  }
  isValid() {
    // Check validity or throw error
    return this;
  }
  text(subject) {
    this.subject = subject;
    return this;
  }
  send() {
    return this;
  }
}

module.exports = SMS;
