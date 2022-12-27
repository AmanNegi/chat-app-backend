var router = require("express").Router();
const { Room } = require("../helper/db.js");
const {
  getErrorResponse,
  getSuccessResponse,
} = require("../helper/response.js");

const {
  joinRoom,
  handleResponse,
  addMessage,
} = require("../helper/functions.js");

// Endpoint to join the chat room
router.post("/join", async (req, res) => {
  var { roomName, userName } = req.body;

  var response = await joinRoom(roomName, userName);
  return handleResponse(response, res);
});

// Endpoint to get list of all messages
router.get("/messages/:roomName", async (req, res) => {
  var roomName = req.params.roomName;
  var room = await Room.find({ roomName: roomName });

  if (room[0] === null || room[0] === undefined)
    return res.send(getErrorResponse("No room exists with this name"));

  var { messages } = room[0];

  // Sort according to latest message received
  messages.sort(function (a, b) {
    return new Date(b.messageDate) - new Date(a.messageDate);
  });

  return res.send(getSuccessResponse("Fetched Data Successfully", messages));
});

router.post("/addMessage", async (req, res) => {
  var { message, roomName } = req.body;

  var response = await addMessage(message, roomName);
  return handleResponse(response, res);
});

module.exports = router;
