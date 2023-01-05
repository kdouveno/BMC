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
			role: "player", // player | admin
			status: info.spectator ? "spectator" : "idle", // idle | spectator | playing | choosing
			reader: false,
			info: {},
			refInfo: {},
			points: 0
		};
		this.setInfos(info);

		BMCs.sessions[this.uuid] = this;
		socket.bmcUser.sessions.set(this.uuid, this);
		socket.bmcSession = this;
	}

	checkInfo(info) {
		var toThrow = [];
		if (typeof(info.displayName) !== "string" && typeof(info.color) !== "string")
			throw "Some input aren't of the good type. Are you trying to mess with us?";
		if (info.displayName.length < 1 & info.displayName.length <= 15)
			toThrow.push("DisplayName must be 1 character long minimum.");
		if (info.color !== "" && !u.strictTest(info.color, /[0-9a-fA-F]{6}/))
			toThrow.push("Color must be an hexadecimal color code");
		if (toThrow.length) {
			console.log("sauce");
			throw toThrow;
		}
	}
	setInfos(info) {
		this.checkInfo(info);
		this.gameData.info = {
			displayName: info.displayName,
			color: (info.color == "" ? this.gameData.info.color : info.color)
		}
		if (u.isndef(this.refInfo))
			this.gameData.refInfo = Object.assign(this.gameData.refInfo, this.gameData.info);
		return true;
	}

	update(othersOnly) {
		(othersOnly ? this.socket : BMCs.io).to(this.room.id).emit("updatePlayers", {[this.publicId]: this.gameData});
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
		this.status = "spectator";
		this.room.sessions.remove(this.uuid);
		this.socket.leave(this.room.uuid + "_play");
		return true;
	}

	kick(reason, dontBother) {
		this.room.sessions.delete(this.uuid);
		this.room.specSessions.delete(this.uuid);
		this.socket.leave(this.room.id + "_play");
		this.socket.leave(this.room.id + "_spec");
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
		if (spec && this.status != "spectator") {
			this.leaveGame();
			this.room.specSessions.set(this.uuid, this);
			this.socket.join(this.room.uuid + "_spec");
		} else if (!spec && this.status == "spectator") {
			this.room.join(this);
		}
	}
}