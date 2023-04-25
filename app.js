var bodyParser = require("body-parser");
var express = require("express");
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;


server.listen(port, function(){
    console.log("listening on port 3000");
});

app.get('/', function (req, res) {
  res.render(__dirname + '/views/index.ejs');
});

app.post("/", function(req, res){
    var roomName = req.body.roomName;

    res.redirect("/room/" + roomName);
});

app.get("/room/:id", function(req, res){
    res.render("room", {roomName: req.params.id});
});

app.get('/', function (req, res) {
    res.send("404 Error");
});