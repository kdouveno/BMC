const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io");
const uuidv1 = require("uuid/v1");
const shit = require("./events.js");

app.get("/", function(req, res){
	res.send("<h1>hello world</h1>");
});


http.listen(8080, function(){
	shit.sauce("listening to 8080");
});
