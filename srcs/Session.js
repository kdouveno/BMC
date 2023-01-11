const uuid	= require("uuid/v1");
const u		= require("../public/scripts/utils.js");
const notif = require("./Notification.js");

module.exports = class Session{
	constructor (socket, room, info){
		this.uuid = uuid();
		this.socket = socket;
		this.room = room;
		this.publicId = uuid();
		this.gameData = {
			admin: false,
			spectator: info.spectator,
			status: "idle", // idle | spectator | playing | choosing
			reader: false,
			info: {},
			refInfo: {},
			points: 0
		};
		this.hand = [];
		this.info = {};
		try {
			this.setInfos(info);
		} catch (e) {
			console.log("error setInfos");
			console.log(e);
			throw e;
		}
		BMCs.sessions[this.uuid] = this;
		socket.bmcUser.sessions.set(this.uuid, this);
		console.log("Saucisse");
		socket.bmcSession = this;
	}

	checkInfo(info) {
		var toThrow = [];
		if (typeof(info.displayName) !== "string" && typeof(info.color) !== "string")
			throw "Some input aren't of the good type. Are you trying to mess with us?";
		if (info.displayName.length < 1 & info.displayName.length <= 15)
			toThrow.push("DisplayName must be 1 to 15 characters long. Is " + info.displayName.length + "long.");
		if (info.color !== "" && !u.strictTest(info.color, /[0-9a-fA-F]{6}/))
			toThrow.push("Color must be an hexadecimal color code");
		if (toThrow.length) {
			throw toThrow;
		}
	}
	setInfos(info) {
		this.checkInfo(info);
		var name = info.displayName;
		if (name)
			name = info.displayName.replace(/\s{2,}/g, " ").trim();
		else if (!this.gameData.displayName)
			name = "User " + (this.room.sessions.size() + this.room.specSessions.size());
		else
			name = this.gameData.displayName;

		this.gameData.info = {
			displayName: name,
			color: (info.color ?? (this.gameData.info.color ?? "F0F0F0"))
		}
		if (u.isndef(this.refInfo))
			this.gameData.refInfo = Object.assign(this.gameData.refInfo, this.gameData.info);
		return true;
	}

	update() {
		BMCs.io.to(this.room.id).emit("updatePlayers", {[this.publicId]: this.gameData});
	}

	resume(soc) {
		this.socket = soc;
		soc.bmcSession = this;
		this.room.insertPlayer(this);
	}

	destroy(dontBother) {
		BMCs.user.deleteSession(this);
		this.room.kick(this, "session destroyed", dontBother);
		delete BMCs.sessions[this.uuid];
	}

	
	leavePlayers() {
		if (!this.room.isSpecAvailable())
			return false;
		console.log("Leave game");
		this.gameData.spectator = true;
		this.room.sessions.remove(this.uuid);
		this.socket.leave(this.room.pid);
		return true;
	}

	kick(reason, dontBother) {
		this.room.sessions.delete(this.uuid);
		this.room.specSessions.delete(this.uuid);
		this.socket.leave(this.room.pid);
		this.socket.leave(this.room.sid);
		this.socket.leave(this.room.id);
		if (!dontBother){
			if (this.room.sessions.size == 0)
				this.room.deref();
			else if (session == admin)
				this.room.setAdmin();
			if (!u.isndef(reason))
				console.log("kicked " + this.gameData.info.displayName + " (" + this.uuid + ") ... reason: " + reason);
		}
	}

	setSpectator(spec) {
		if (spec && !this.gameData.spectator) {
			this.leaveGame();
			this.room.specSessions.set(this.uuid, this);
			this.socket.join(this.room.sid);
		} else if (!spec && this.gameData.spectator) {
			this.room.join(this);
		}
	}
}