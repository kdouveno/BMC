const uuid	= require("uuid/v1");
const u		= require("./local/scripts/utils.js");
const Stack	= require("./Stack.js");

module.exports = class Room {
	constructor (socket)
	{
		this.uuid = uuid();
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
		socket.bmc.rooms[this.uuid] = this;
	}

	kick(session, reason, dontBother) {
		this.sessions.delete(session.uuid);
		this.specSessions.delete(session.uuid);
		if (!dontBother){
			if (this.sessions.size == 0)
				this.deref();
			else if (session == admin)
				this.setAdmin();
			if (!u.isndef(reason))
				console.log("kicked " + session.uuid + "... reason: " + reason);
		}
		session.socket.leave(this.uuid);
	}

	join(session) {
		this.sessions.set(session.uuid, session);
		var roomForPlayer = this.sessions.size < this.maxPlayers;
		if (session.status == "spectator" || !roomForPlayer){
			this.specSessions.set(session.uuid, session);
			session.socket.join(this.uuid + "_spec");
			session.status = "spectator";
		}
		else {
			this.sessions.set(session.uuid, session);
			session.socket.join(this.uuid);
			this.insertPlayer(session);
		}
		if (u.isndef(this.admin))
			this.setAdmin(session);
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
		delete this.bmc.rooms[this.uuid];
	}
}