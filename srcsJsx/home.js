const socket = io("/", {
	query: {
		userId: localStorage.userId
	}
});

BMC = new ClientBMC();
var playerList = <PlayerContainer />
var deckList = <DeckContainer />

$(document).ready(function(){
	KDformInit();
	u.registerEvents(socket, socketEvents);
	ReactDOM.render(playerList, document.getElementById("userScrollContent"));
	ReactDOM.render(deckList, document.getElementById("deckContainer"));
	var query = u.getUrlVars();
	u.assignForm("login", query);
	if (query.direct)
		enter();
}); 

function enter(){
	var userPrefs = KDform.objForm("#login");
	console.log(userPrefs);

	socket.emit("knockRoom", userPrefs);
}

function playerUpdate() {
	var obj = KDform.objForm("#playerInfos");
	console.log("Updating User");
	console.log(obj);
	socket.emit("playerUpdate", obj);
}
function settingsUpdate() {
	if (BMC.plc.players[BMC.plc.me].role == "admin") {
		var obj = KDform.objForm("#gameSettings");
		console.log(obj);
		socket.emit("settingsUpdate", obj);
	}
}