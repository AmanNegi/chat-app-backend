const { disconnectUser, validateUser } = require("./functions.js");

module.exports = function setConnection(io) {
  io.on("connection", (socket) => {
    console.log("User is connected");

    var connectionData = {};

    socket.on("event", (data) => {
      console.log("The data is: " + JSON.stringify(data));
    });

    socket.on("setData", async (e) => {
      console.log("Set data: " + JSON.stringify(e));
      connectionData = e.data;

      const { userName, roomName } = connectionData;
      const { data: valid } = await validateUser(userName, roomName);

      if (!valid) {
        io.emit("error", { errorLevel: "Fatal" });
      }
    });

    socket.on("disconnect", async (data) => {
      console.log("The user closed the socket connection", connectionData);
      const { userName, roomName } = connectionData;
      if (userName === null || roomName === null) {
        return console.log("No data was available to disconnect the user");
      }

      var response = await disconnectUser(userName, roomName);
      console.log(response);
    });
  });
};
