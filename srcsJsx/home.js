const socket = io("/", {
	query: {
		userId: localStorage.userId
	}
});

BMC = new ClientBMC();

$(document).ready(function(){
	KDformInit();
	u.registerEvents(socket, socketEvents);
	ReactDOM.render(<PlayerContainer />, u.gebid("userContent"));
	ReactDOM.render(<DeckContainer />, u.gebid("deckContainer"));
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