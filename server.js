require("dotenv").config();
const process = require("process");
const app = require("./app");
const socket = require("./src/config/socket");
const port = process.env.PORT || 5000;
let server = app.listen(port, () => {
  console.log(`Server is on 🔥 on port ${port}`);
});

socket(server);
