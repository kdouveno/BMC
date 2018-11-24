ge = {
	playerUpdate: function(data){
		game.users[data.id] = data.user;
		console.log(game.users[data.id].data.refInfo.displayName + " loaded. (id: " + data.id + ")");
	},
	loadUser: function(data){
		if (u.isndef(game.users[data.id]))
			game.users[data.id] = {};
		game.users[data.id] = data.user;
		console.log(game.users[data.id].data.refInfo.displayName + " loaded. (id: " + data.id + ")");
	},
	receiveMessage: function(data){
		console.log(data);
	}
}
