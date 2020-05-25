const uuid	= require("uuid/v1");
const u		= require("./public/scripts/utils.js");
const Stack	= require("./Stack.js");


module.exports = class Room {
	constructor (socket, id)
	{
		this.id = !id ? uuid() : id;
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
			decks: new Map()
		};
		this.gameData = {
			ingame: false,
			stack: new Stack(),
			status: "idle"
		}
		this.bmc = socket.bmc;
		socket.bmc.rooms[this.id] = this;
	}

	kick(session, reason, dontBother) {
		this.sessions.delete(session.uuid);
		this.specSessions.delete(session.uuid);
		session.socket.leave(this.id + "_play");
		session.socket.leave(this.id + "_spec");
		session.socket.leave(this.id);
		if (!dontBother){
			if (this.sessions.size == 0)
				this.deref();
			else if (session == admin)
				this.setAdmin();
			if (!u.isndef(reason))
				console.log("kicked " + session.uuid + "... reason: " + reason);
		}
	}

	join(session) {
		this.sessions.set(session.uuid, session);
		var roomForPlayer = this.sessions.size < this.maxPlayers;
		session.socket.join(this.id);
		if (session.status == "spectator" || !roomForPlayer){
			this.specSessions.set(session.uuid, session);
			session.socket.join(this.id + "_spec");
			session.status = "spectator";
		}
		else {
			this.sessions.set(session.uuid, session);
			session.socket.join(this.id + "_play");
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
		session.socket.emit("roomJoined");
		session.socket.emit("me", [session.publicId, session.uuid]);
		session.socket.in(this.id).emit("updatePlayers", {[session.publicId]: session.gameData})
		this.UpdateAllPlayers(session);
	}
	UpdateAllPlayers(session) {
		var out = {};
		this.sessions.forEach((ses) => {
			out[ses.publicId] = ses.gameData;
		});
		(session ? session.socket : this.bmc.io.to(this.id)).emit("updatePlayers", out);
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
		delete this.bmc.rooms[this.id];
	}


	emitPlayerJoined() {
		this
	}
}