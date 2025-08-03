const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
exports.generateWebToken = async (userId) => {
  // console.log(secret);
  let token = await jwt.sign(
    {
      userId,
    },
    secret
  );

  return token;
};
