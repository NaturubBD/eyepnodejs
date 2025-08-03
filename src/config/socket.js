// Chat with Socket

module.exports = function (server) {
  global.io = require("socket.io")(server, {
    allowEIO3: true,
    path: "/socket",
    cors: {
      // origin: true,
      methods: ["GET", "POST"],
      // credentials: true,
    },
    secure: false,
  });

  io.on("connection", (socket) => {
    console.log("Socket connected to:", socket.id);
    socket.on("disconnect", () => {
      console.log("Disconnected from: " + socket.id);
    });
    socket.on("joinSupportRoom", async ({ supportId }) => {
      socket.join(supportId);
      console.log("A user joined supportId: " + supportId);
    });
    socket.on("joinAppointmentRoom", async ({ appointmentId }) => {
      socket.join(appointmentId);
      console.log("A user joined appointmentId: " + appointmentId);
    });


    socket.on("doctorRoom", async ({ doctorId }) => {
      socket.join(doctorId);
      console.log("A user joined doctorId: " + doctorId);
    });

    socket.on("patientRoom", async ({ patientId }) => {
      socket.join(patientId);
      console.log("A user joined patientId: " + patientId);
    });

    socket.on("joinAppointmentRoom", async ({ appointmentId }) => {
      socket.join(appointmentId);
      console.log("A user joined appointmentId: " + appointmentId);
    });


    socket.on("rejectCall", async (data) => {
      socket.to(data.appointmentId).emit("rejectCall", data);
      console.log("Reject Call Triggered");
    });

    socket.on("endCall", async (data) => {
      socket.to(data.appointmentId).emit("endCall", data);
      console.log("End Call Triggered");
    });

    socket.on("joinedCall", async (data) => {
      socket.to(data.appointmentId).emit("joinedCall", data);
      console.log("Joined Call Triggered");
    });
    socket.on("leaveSupportRoom", ({ supportId }) => {
      socket.leave(supportId);
      console.log("A user left chatroom: " + supportId);
    });
  });
};
