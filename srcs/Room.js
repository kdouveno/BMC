const uuid	= require("uuid/v1");
const u		= require("../public/scripts/utils.js");
const _		= require("../public/scripts/lodash.js");
const Deck	= require("./Deck.js");
class Cards {
	constructor(room){
		this.room = room;
		this.busy = false;			// true while loading decks
		this.decks = [];			// the List of decks that defines all the indexes must not change while in-game
		this.callStock = [];
		this.callWaste = [];
		this.resStock = [];
		this.resWaste = [];
	}

	addDeck(code5, callback){
		if(this.decks.find(o=>o.code5 == code5))
			return ;
		this.busy = true;
		new Deck(code5, (self)=>{
			this.decks.push(self);
			this.busy = false;
			callback();
		});
	}

	setCallMultiplier(code5, m){
		var deck = this.decks.find(o=>o.code5 = code5);
		if (deck)
			deck.callMultiplier = m;
	}

	setResMultiplier(code5, m){
		var deck = this.decks.find(o=>o.code5 = code5);
		if (deck)
			deck.resMultiplier = m;
	}
	
	setMultiplier(code5, m){
		this.setCallMultiplier(code5, m);
		this.setResMultiplier(code5, m);
	}

	getCallCard(Cardi_b){
		return this.decks[Cardi_b[0]].deck.calls[Cardi_b[1]];
	}
	getResCard(Cardi_b){
		return this.decks[Cardi_b[0]].deck.res[Cardi_b[1]];
	}

	init(){
		u.shuffle(this.decks.map((d, i)=>u.multiply(d.getCallStock().map(c=>[i, c]), d.callMultiplier)));
		u.shuffle(this.decks.map((d, i)=>u.multiply(d.getResStock().map(c=>[i, c]), d.resMultiplier)));
	}
	updateDecks(){
		BMCs.io.in(this.room.id).emit("updateDecks", this.decks);
	}
}
module.exports = class Room {
	constructor (id)
	{
		this.id = !id ? uuid() : id;
		this.sid = id + "_spec";
		this.pid = id + "_play";
		this.sessions = new Map();
		this.specSessions = new Map();
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
			kickAfks: true,
		};
		this.cards = new Cards(this);
		this.gameData = {
			ingame: false,
			plOrder: []
		}
		BMCs.rooms[this.id] = this;
	}

	gameStart(){
		this.gameData.ingame = true;
		this.cards.init();
		this.gameData.plOrder = u.shuffle(this.sessions.keys());
	}

	join(session) {
		var roomForPlayer = this.sessions.size < this.settings.maxPlayers;
		session.socket.join(this.id);
		if (session.gameData.spectator || !roomForPlayer){
			this.specSessions.set(session.uuid, session);
			session.socket.join(this.sid);
		}
		else {
			this.sessions.set(session.uuid, session);
			session.socket.join(this.pid);
		}
		if (u.isndef(this.admin))
			this.setAdmin(session);
		this.insertPlayer(session);
	}
	setAdmin(session) {
		if (!u.isndef(this.admin))
			this.admin.gameData.role = "player";
		this.admin = this;
		session.gameData.role = "admin";
	}
	insertPlayer(session) {
		console.log("player joined");
		session.socket.emit("roomJoined", this.id);
		session.socket.emit("me", [session.publicId, session.uuid]);
		this.UpdateAllPlayers();
	}
	UpdateAllPlayers() {
		var out = {};
		if (this.gameData.ingame) {
			this.gameData.plOrder.forEach(o=>{
				out[o] = this.sessions.get(o).gameData;
			});
		} else {
			this.sessions.forEach((ses) => {
				out[ses.publicId] = ses.gameData;
			});
		}
		this.specSessions.forEach((ses) => {
			out[ses.publicId] = ses.gameData;
		});
		BMCs.io.to(this.id).emit("updatePlayers", out);
	}

	hasRoom(spec) {
		if (spec || !this.isPlayAvailable())
			return this.isSpecAvailable();
		return true;
	}

	isSpecAvailable() {
		return this.specSessions.size < this.settings.maxSpectators;
	}
	isPlayAvailable() {
		return this.sessions.size < this.settings.maxPlayers;
	}

	purge() {
		this.sessions.forEach((k, v)=>{
			v.destroy(true);
		});
		this.specSessions.forEach((k, v)=>{
			v.destroy(true);
		});
	}

	deref() {
		this.purge();
		delete BMCs.rooms[this.id];
	}
	
	checkSettings(settings) {
		if (typeof(settings) !== "object"
		||	typeof(settings.maxPlayers) !== "number"
		||	typeof(settings.maxSpectators) !== "number"
		||	typeof(settings.nbrRound) !== "number"
		||	typeof(settings.locked) !== "boolean"
		|| 	typeof(settings.canSurrender) !== "boolean"
		||	typeof(settings.chooseTime) !== "number"
		||	typeof(settings.AFKkick) !== "boolean"
		||	typeof(settings.handLength) !== "number")
		{
			console.log(typeof(settings));
			console.log(typeof(settings.maxPlayers));
			console.log(typeof(settings.maxSpectators));
			console.log(typeof(settings.locked));
			console.log(typeof(settings.canSurrender));
			console.log(typeof(settings.chooseTime));
			console.log(typeof(settings.AFKkick));
			console.log(typeof(settings.handLength));
			
			throw ("Some input aren't of the good type. Are you trying to mess with us?");
		}
	}

	updateSettings(settings) {
		this.checkSettings(settings);
		_.merge(this.settings, settings);
		BMCs.io.to(this.id).emit("updateSettings", this.settings);
	}
	emit(name, data){
		BMCs.io.to(this.id).emit(name, data);
	}
}