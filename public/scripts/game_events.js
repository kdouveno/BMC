ge = {
	playerUpdate: function(data) {
		Object.assign(game.users[data.id], data.user);
		var id = (typeof(data.id) == "number") ? "#0" : data.id.match(/#.*/)[0];
		console.log(game.users[data.id].info.displayName);
		$(id).css("--pc", "#" + game.users[data.id].info.color);
		$(id).find("h3").changeValue(game.users[data.id].info.displayName);
	},
	loadUser: function(data) {
		if (data.id == 0){
			if (/modo|owner/.test(data.user.data.role))
				$("fieldset.modOnly").removeAttr("disabled");
			else {
				$("fieldset.modOnly").attr("disabled", true);
			}
		}
		if (u.isndef(game.users[data.id]))
			game.users[data.id] = {};
		Object.assign(game.users[data.id], data.user);
		var id = (typeof(data.id) == "number") ? "#0" : data.id.match(/#.*/)[0];
		if ($(id)[0])
			$(id).remove();
		$((data.user.data.spec ? "#spectatorsContainer" : "#playersContainer")).append(`<div id="`+ id.substring(1) +`" class="user" style="--pc: #`+ data.user.info.color +`">
			<div class="hover"></div>
			<div>
				<h3>`+ data.user.info.displayName +`</h3>
				<h5>`+ data.user.data.status +`</h5>
			</div>
			<div><h1>0</h1></div>
		</div>`);
		if (logged){
			console.log($(id));
			$(id).addClass("shown");
		}
	},
	alert: function(msg) {
		alert(msg);
	},
	updateSettings: function(settings) {
		game.settings = settings;
		KDform.inject("#gameSettings", game.settings);
	},
	updateDecks: function(decks) {
		game.decks = decks;
		var local = $("#decks tr[id]:not(#deckAdd)").map(function(){
			return (this.id);
		}).get();
		var tmp = Object.assign({}, decks);
		local.forEach(o => {
			if (u.isndef(tmp[o])) {
				$("#"+ o).remove();
			} else {
				$("#"+ o +" input").get(0).value = tmp[o];
				delete tmp[o];
			}
		});
		for (key in tmp) {
			addDeck(key, tmp[key]);
		}
	},
	kickedOut: function(data) {
		console.log("you got kicked out of "+ data.id +" for the following reason:\n");
		console.log(data.msg);
	},
	gameStatus: function(data) {
		console.log("GAMESTATUS");
		game.settings = data.settings;
		game.data = data.data;
	},
	updateHand: function(hand){
		me.hand = hand;
		console.log("HAND");
	},


	playWhiteRes: function(res) {
		console.log(res ? "play white confirmed" : "play white rejected");
	},
	chooseRes: function(res) {
		console.log(res ? "choose confirmed" : "choose rejected");
	},
	timerDate: function(time) {
		console.log("TIMER");
		console.log(time);
	},
	playedWhites: function(tab) {
		game.playedWhites = tab;
	},
	win: function(id) {
		console.log(game.users[id].info.displayName + " WINS the round");
	},
	gameWin: function(tab) {
		tab.forEach(id => {
			if (id == gameSocket.id)
				console.log("YOU WIN the game");
			else
				console.log(game.users[id].info.displayName + " WINS the game");
		});
	}
}
