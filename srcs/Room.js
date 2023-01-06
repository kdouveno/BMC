const uuid	= require("uuid/v1");
const u		= require("../public/scripts/utils.js");
const _		= require("../public/scripts/lodash.js");
const Deck	= require("./Deck.js");
class Cards {
	constructor(room){
		this.room =	room;
		this.busy = false;			// true while loading decks
		this.decks = [];			// the List of decks that defines all the indexes must not change while in-game
		this.callStock = [];
		this.callWaste = [];
		this.resStock = [];
		this.resWaste = [];
	}

	addDeck(code5){
		if(this.decks.find(o=>o.code5 = code5))
			return ;
		this.busy = true;
		new Deck(code5, (self)=>{
			this.decks.push(self);
			this.busy = false;
		});
	}

	init(){
		u.shuffle(this.decks.map((d, i)=>d.getCallStock().map(c=>[i, c])));
		u.shuffle(this.decks.map((d, i)=>d.getResStock().map(c=>[i, c])));
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
		this.cards = new Cards();
		this.gameData = {
			ingame: false,
			status: "idle"
		}
		BMCs.rooms[this.id] = this;
	}

	gameStart(){

	}

	join(session) {
		this.sessions.set(session.uuid, session);
		var roomForPlayer = this.sessions.size < this.maxPlayers;
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
		this.sessions.forEach((ses) => {
			out[ses.publicId] = ses.gameData;
		});
		BMCs.io.to(this.id).emit("updatePlayers", out);
	}

	hasRoom(spec) {
		if (spec) {
			return this.isSpecAvailable();
		} else {
			return this.isPlayAvailable() || this.isSpecAvailable();
		}
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
		io.to(this.id).emit("updateSettings", this.settings);
	}
}