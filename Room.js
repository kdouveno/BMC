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
			handLength: 11,
			chooseTime: 60,
			pickTime: 60,
			pauseTime: 8,
			midgameJoining: true,
			allowMultiTabs: true,
			SpectatorPeak: false,
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
		this.socket.leave(this.room.id + "_play");
		this.socket.leave(this.room.id + "_spec");
		this.socket.leave(this.room.id);
		if (!dontBother){
			if (this.sessions.size == 0)
				this.deref();
			else if (session == admin)
				this.setAdmin();
			if (!u.isndef(reason))
				console.log("kicked " + session.uuid + "... reason: " + reason);
		}
		session.socket.leave(this.id);
	}

	join(session) {
		this.sessions.set(session.uuid, session);
		var roomForPlayer = this.sessions.size < this.maxPlayers;
		session.socket.join(this.uuid);
		if (session.status == "spectator" || !roomForPlayer){
			this.specSessions.set(session.uuid, session);
			session.socket.join(this.id + "_spec");
			session.status = "spectator";
		}
		else {
			this.sessions.set(session.uuid, session);
			session.socket.join(this.id + "_play");
			session.socket.emit("joinGame", session);
			this.insertPlayer(session);
		}
		if (u.isndef(this.admin))
			this.setAdmin(session);
		this.insertPlayer(session);
	}
	setAdmin(session) {
		if (!u.isndef(this.admin))
			this.admin.role = "player";
		this.admin = this;
		session.role = "admin";
	}
	insertPlayer(session) {
		console.log("player joined");
		session.socket.emit("roomJoined");
		this.bmc.io.to(this.id).emit("playerJoined", session.gameData);
	}

	hasRoom(spec) {
		if (spec) {
			return this.isSpecAvailable();
		} else {
			return this.isPlayAvailable() || this.isSpecAvailable();
		}
	}

	isSpecAvailable() {
		return this.specSessions.size < this.maxSpectators;
	}
	isPlayAvailable() {
		return this.sessions.size < this.maxSpectators;
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