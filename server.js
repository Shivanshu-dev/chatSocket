const path = require("path");
const http = require("http");
const PORT = 5000 || process.env.PORT;
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages.js");
const {
  joinUser,
  getCurrentUser,
  leaveChat,
  getRoomUsers,
} = require("./utils/users.js");

const app = express();

const admin = "shivanshu";

const server = http.createServer(app);
const io = socketio(server);

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile("index.html");
});

io.on("connection", (socket) => {
  socket.on("JoinRoom", ({ username, room }) => {
    const user = joinUser(socket.id, username, room);

    socket.join(user.room);
    // send msg to everyone
    socket.emit("message", formatMessage(admin, "welcome to chat"));

    // everyone except the one connecting

    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(admin, `${user.username} has joined`));

    // users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // listen to chat msg
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // on disconnecting
  socket.on("disconnect", () => {
    const user = leaveChat(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(admin, `${user.username} has  disconnected`)
      );
      // users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

server.listen(PORT, console.log(`server up${PORT}`));
