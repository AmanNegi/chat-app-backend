var mongoose = require("mongoose");

function connectDatabase() {
  var dbUrl = 
  process.env.DATABASE_URL;
  //  "mongodb://localhost/simple-chat";

  mongoose.connect(dbUrl, (err) => {
    if (err) console.log("An error occurred while connecting", err);
    else console.log("Connected to MongoDB...");
  });
}

var messageSchema = {
  name: String,
  message: String,
  messageDate: {
    type: Date,
    default: () => {
      return new Date();
    },
  },
};

var Message = mongoose.model("Message", messageSchema);

var Room = mongoose.model("Room", {
  roomName: String,
  messages: [{ type: messageSchema }],
  participants: [{ type: String, default: [] }],
});

function validateMessage(message) {
  console.log("Validating message", message);

  if (message === null || message.name === null || message.name.length <= 0) {
    return { success: false, message: "Enter a valid name" };
  } else if (message.message === null || message.message.length <= 0) {
    return { success: false, message: "Enter a valid message" };
  }

  return { success: true, message: "It is a valid message" };
}

module.exports = { Message, connectDatabase, validateMessage, Room };
