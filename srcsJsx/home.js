const socket = io("/", {
	query: {
		userId: localStorage.userId
	}
});

var playerList = <PlayerContainer />

$(document).ready(function(){
	KDformInit();
	u.registerEvents(socket, socketEvents);
	ReactDOM.render(playerList, document.getElementById("userScrollContent"));
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

function decode(e){
	if (e.value.replace(/[0-9A-Za-z]{5}?/, "") == ""){
		e.value = e.value.toUpperCase();
		$.getJSON("https://api.cardcastgame.com/v1/decks/" + e.value, function(data){
			$(e).parent().siblings("td[colspan=3]").html('<span style="color: var(--gc)">'+ data.name +"</span>");
		}).fail(()=>{
			$(e).parent().siblings("td[colspan=3]").html('<span style="color: var(--ec)">Deck Not Found</span>');
		});
	}
}

function addDeck(e, n){
	e = e ? e : $("#deckAdd input").get(0).value;
	if (e.replace(/[0-9A-Z]{5}?/, "") == ""){
		$.getJSON("https://api.cardcastgame.com/v1/decks/" + e, function(data){
			$("#deckAdd").after(`<tr id="`+data.code+`" class="deck">
				<td>`+ data.code +`</td>
				<td>
					<input name="`+ data.code +`" type="number" value="`+ (n ? n : 0) +`">
				</td>
				<td>`+ data.name +`</td>
				<td>`+ data.call_count +`</td>
				<td>`+ data.response_count +`</td>
			</tr>`);
			KDform.setNumInputs("#decks");
		}).fail(()=>{
			$(e).parent().siblings("td[colspan=3]").html('<span style="color: var(--ec)">Deck Not Found</span>');
		});
	}
}
function playerUpdate() {
	var obj = KDform.objForm("#playerInfos");
	console.log("Updating User");
	console.log(obj);
	socket.emit("playerUpdate", obj);
}
function settingsUpdate() {
	if (ExternPlayersState.players[ExternPlayersState.me].role == "admin") {
		var obj = KDform.objForm("#gameSettings");
		console.log(obj);
		socket.emit("settingsUpdate", obj);
	}
	
}