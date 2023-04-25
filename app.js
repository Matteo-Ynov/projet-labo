var bodyParser = require("body-parser");
var express = require("express");
var path = require("path");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log("listening on port 3000");
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

var user_number = 0;

io.on("connection", function (socket) {
  io.to(socket.handshake.query.roomName).emit("newUser");
  socket.join(socket.handshake.query.roomName, function () {
    io.to("${socketId}").emit("newUser");
  });
  socket.on("play", function (room) {
    io.to(room).emit("playPlayer");
  });
  socket.on("pause", function (room) {
    io.to(room).emit("pausePlayer");
  });
  socket.on("buffering", function (time, room) {
    io.to(room).emit("bufferingPlayer", time);
  });
  socket.on("playback", function (rate, room) {
    io.to(room).emit("playbackPlayer", rate);
  });
  socket.on("newVideo", function (url, room) {
    var newVideoID = url.split("v=")[1];
    io.to(room).emit("newVideo", newVideoID);
  });

  var addedUser = false;

  socket.on("new message", (data) => {
    socket.broadcast.emit("new message", {
      username: socket.username,
      message: data,
    });
  });

  socket.on("add user", (username) => {
    if (addedUser) return;

    socket.username = username;
    user_number += 1;
    addedUser = true;
    socket.emit("login", {
      numUsers: user_number,
    });
    socket.broadcast.emit("user joined", {
      username: socket.username,
      numUsers: user_number,
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing", {
      username: socket.username,
    });
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing", {
      username: socket.username,
    });
  });

  socket.on("disconnect", () => {
    if (addedUser) {
      user_number -= 1;

      socket.broadcast.emit("user left", {
        username: socket.username,
        numUsers: user_number,
      });
    }
  });
});

app.get("/", function (req, res) {
  res.render(__dirname + "/views/index.ejs");
});

app.post("/", function (req, res) {
  var roomName = req.body.roomName;

  res.redirect("/room/" + roomName);
});

app.get("/room/:id", function (req, res) {
  res.render("room", { roomName: req.params.id });
});

app.get("/", function (req, res) {
  res.send("404 Error");
});
