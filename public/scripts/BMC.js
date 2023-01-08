var localDecks = function(){
	var out = [];
	out.getCallCard = (Cardi_b)=>{
		return this[Cardi_b[0]].deck.calls[Cardi_b[1]];
	}
	out.getResCard = (Cardi_b)=>{
		return this[Cardi_b[0]].deck.res[Cardi_b[1]];
	}
	return out;
}

class ClientBMC {
	constructor(){
		this.players = {
			players: {},
			me: "",
			show: 0
		};
		this.settings = {
			maxPlayers: 10,
			maxSpectators: 10,
			nbrRound: 3,
			locked: false,
			canSurrender: true,
			handLength: 11,
			chooseTime: 60,
			pauseTime: 8,
			// allowMultiTabs: true,
			// SpectatorPeak: false,
			kickAfks: true
		};
		this.decks = new localDecks(),
		this.hand = [],
		this.board = {
			
		}
	}
	
}
