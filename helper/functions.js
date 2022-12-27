const { Room, Message, validateMessage } = require("./db.js");
const { getErrorResponse, getSuccessResponse } = require("./response.js");
const io = require("../app.js");

async function joinRoom(roomName, userName) {
  var response = { err: null, message: null, data: null };

  var result = await Room.find({ roomName: roomName });
  console.log("Joining Room", roomName);

  var room, newMessage;

  if (result.length <= 0) {
    console.log("No Records exists, Creating Room.");
    room = new Room({ roomName: roomName });
    newMessage = new Message({
      message: userName + " has created the room.",
      name: userName,
    });
  } else {
    console.log("Room found, joining the Room.");
    room = result[0];

    const welcomeMessage = userName + " has joined the chat";

    newMessage = new Message({
      message: welcomeMessage,
      name: userName,
    });
  }

  const contains = room.participants.includes(userName);
  if (contains) {
    response.err = `A user with Username \"${userName}\" exists in ${roomName}`;
    return response;
  }
  room.participants = [...room.participants, userName];
  room.messages = [...room.messages, newMessage];

  var { error } = await room.save();
  if (error) {
    response.err = error;
    return response;
  }

  response.data = newMessage;
  response.message = "Data was added successfully";

  return response;
}

async function addMessage(message, roomName) {
  var response = { err: null, message: null, data: null };

  var valid = validateMessage(message);
  if (valid.success === false) {
    response.err = valid;
    return response;
  }
  var message = new Message(message);
  var room = await Room.findOne({ roomName: roomName });

  if (room === null || room === null) {
    response.err = "No room found";
    return response;
  }

  room.messages = [...room.messages, message];
  var { err } = await room.save();

  if (err) {
    response.err = "An error occured while saving the message";
    return response;
  }

  // Sort messages before sending updated messages
  room.messages.sort(function (a, b) {
    return new Date(b.messageDate) - new Date(a.messageDate);
  });

  var socket = io;
  if (socket !== null && socket !== undefined) {
    socket.emit("event", {
      action: "Refresh",
      message: "New message was added to room, refresh the page.",
    });
  }

  response.message = "Message was added to the room";
  response.data = room.messages;
  return response;
}

async function disconnectUser(userName, roomName) {
  if (userName === undefined || roomName === undefined) return;
  var response = { err: null, data: null, message: null };

  var res = await addMessage(
    {
      message: `${userName} disconnected from ${roomName}`,
      name: userName,
    },
    roomName
  );
  console.log("Add Message Response  : ", res.message);

  var room = await Room.findOne({ roomName: roomName });

  if (room === null) {
    response.err = "No room found";
    return response;
  }

  const exists = room.participants.includes(userName);
  if (!exists) {
    response.err = "No user exists in the room with this name";
    return response;
  }

  room.participants = room.participants.filter((e) => e !== userName);

  try {
    if (room.participants.length <= 0) await room.delete();
    else await room.save();
  } catch (e) {
    if (e) {
      response.err = e;
      return response;
    }
  }
  response.message = "User deleted successfully";
  response.data = room.participants;

  return response;
}

/**
 *
 * @param {String} userName
 * @param {String} roomName
 * @returns {Object} {err, data, message}
 */
async function validateUser(userName, roomName) {
  var response = { err: null, data: false, message: "Does not exist" };

  var room = await Room.findOne({ roomName: roomName });

  if (room === null) {
    response.err = "No room found";
    return response;
  }

  if (room.participants.includes(userName)) {
    response.message = "User exists";
    response.data = true;
  }

  return response;
}

async function handleResponse(response, res) {
  if (response.err) {
    return res.send(getErrorResponse(response.err));
  }
  return res.send(getSuccessResponse(response.message, response.data));
}

module.exports = {
  joinRoom,
  addMessage,
  handleResponse,
  disconnectUser,
  validateUser,
};
