const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: ["https://amannegi.github.io", "https://localhost:3000"],
  },
});

module.exports = io;

require("./helper/socket.js")(io);

const chat = require("./routes/chat.js");
const { connectDatabase } = require("./helper/db.js");
const cors = require("cors");

app.use(express.json());
app.use(
  cors()
  //   {
  //   origin: "https://amannegi.github.io",
  //   methods: "GET,HEAD,PUT,PATCH,DELETE",
  // }
);
app.use(express.urlencoded());
app.use("/chat", chat);

connectDatabase();
const PORT = process.env.PORT || 5000;
http.listen(PORT, () => {
  console.log(`Listening at PORT... ${PORT}`);
});
