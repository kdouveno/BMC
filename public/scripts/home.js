const socket = io("/");

userPrefs = {
	displayName: "Anon",
	color: "",
}
alertTimer = undefined;
logged = false;

$(document).ready(function() {
	login.login();
	KDformInit();
	socket.on("newGame", initGame);
});

function enter(){
	userPrefs = KDform.objForm("#login");
	if ($("#enter").hasClass("join"))
		initGame(userPrefs.token);
	else
		newGame();
}

function getToken(){
	return window.location.href.split("?")[1];
}

function initGame(id) {
	socket.emit("joinNsp", id, (res)=>{
		if (!res)
			return alert("there's no Room with this token id...");
		gameSocket = io("/" + id, {forceNew: true, query: {data: JSON.stringify(userPrefs)}});
		gameSocket.on("connect", function(){
			window.history.pushState("", "", "?" + id);
			console.log('joinGame("'+id+'")');
			ui.displayGameUI();
			setTimeout(() => {
				$(".user").each(function(i){
					setTimeout(()=>{
						$(this).addClass("shown");
					}, i * 100);
				});
				logged = true;
			}, 1000);
			game = {
				settings: {
					maxPlayers: 10,
					maxSpectators: 10,
					nbrRound: 5,
					locked: true,
					canSurrender: false,
					AFKTime: 60000,
					AFKkick: false,
					gameMode: "1by1",
					handLength: 7
				},
				data: {
					status: "setting",
				},
				users: {
					0: {
						info: {
							displayName: "anon",
							color: "FFFFFF",
						},
						data: {
							order: 0,
							status: "waiting",
							onfocus: false,
							writing: false,
							spectator: false,
							role: "user",
							refInfo: {
								displayName: "anon",
								color: "FFFFFF"
							}
						}
					}
				},
				decks: {
				}
			}
			me = game.users[0];
			Object.keys(ge).forEach(function(o) {
				gameSocket.on(o, function(data) {
					ge[o](data);
				});
			});
		});
	});
}

function newGame() {
	socket.emit("newGame");
}

function joinGame(id) {
	initGame(id);
}

function playerUpdate() {
	me.info = KDform.objForm("#playerInfos");
	gameSocket.emit("playerUpdate", game.users[0].info);
}

function logIn(spec) {
	gameSocket.emit("logIn", {info: game.users[0].info, spec: spec});
}

function sendMessage(msg) {
	gameSocket.emit("sendMessage", msg);
}

function updateSettings() {
	game.settings = KDform.objForm("#gameSettings");
	console.log(game.settings);
	gameSocket.emit("updateSettings", game.settings);
}

function updateDecks() {
	game.decks = KDform.objForm("#decks");
	console.log(game.decks);
	gameSocket.emit("updateDecks", game.decks);
}

function startGame() {
	gameSocket.emit("startGame");
}
function alert(msg) {
	console.log(msg);
	$("#alertContainer h2").text(msg);
	$("#alertContainer").addClass("shown");

	if (!u.isndef(alertTimer))
		clearTimeout(alertTimer);
	alertTimer = setTimeout(() => {
		$("#alertContainer").removeClass("shown");
	}, 4000);
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
jQuery.fn.extend({
	changeValue: function(value) {
		var o = $(this);
		var at = parseInt($(this).css("--at"));
		var dur = at * 75;
		$(this).css("transition", "all "+dur+"ms linear");
		$(this).css("opacity", 0);
		$(this).css("transform", "scale(.5)");
		setTimeout(() => {
			$(this).text(value);
			$(this).css("opacity", "");
			$(this).css("transform", "");
			setTimeout(() => {
				$(this).css("transition");
			}, dur);
		}, dur);
		return this;
	}
});
