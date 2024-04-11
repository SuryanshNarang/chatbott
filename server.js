const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botName = "ChatApp";
const PORT = process.env.PORT || 3000;

//set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when a client connects
io.on("connect", (socket) => {
  socket.on("joinroom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    //Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to Chat App")); //to a single client

    //Broadcast when a user connects
    socket.broadcast.to(user.room).emit(
      "message",
      formatMessage(botName, `${user.username} has joined the chat`)
    )//the person who is getting connected will dont get the message rest all will get the message
    io.to(user.room).emit('roomusers',{
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  //Listen for chat Message...  phle hummne form value li  then emit kra fir server js m listen krre hai
  // Listen for chat messages
socket.on("chatMessage", (msg) => {
  // Get the current user
  const user = getCurrentUser(socket.id);
  console.log("Current user:", user); // Add this line to check the user object
  
  // Emit the message to all clients in the same room
  io.to(user.room).emit("message", formatMessage(user.username, msg));
});

  //Runs when client disconnect
  socket.on("disconnect", () => {
    const user= userLeave(socket.id);
    if(user){
      io.to(user.room).emit("message", formatMessage("USER", `${user.username} has left the chat`)); // Corrected the message format
    }
    io.to(user.room).emit('roomusers',{
      room: user.room,
      users: getRoomUsers(user.room)
    })
   
  });
});

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
