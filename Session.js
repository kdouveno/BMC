const uuid	= require("uuid/v1");
const u		= require("./public/scripts/utils.js")

module.exports = class Session{
	constructor (socket, room, info){
		this.uuid = uuid();
		this.socket = socket;
		this.room = room;
		this.setInfo(info);
		this.status = info.spectator ? "spectator" : "idle";
		this.role = "player";

		socket.bmc.sessions[this.uuid] = this;
		socket.user.sessions[this.uuid] = this;
	}

	setInfo(info){
		this.info = {
			displayName: info.displayName,
			color: info.color
		}
		if (u.isndef(this.refInfo))
			this.refInfo = Object.assign({}, this.info);
	}

	resume(soc) {
		console.log("Resume");
		
	}

	destroy(dontBother) {
		var bmc = this.socket.bmc;
		bmc.user.deleteSession(this);
		this.room.kick(this, "session destroyed", dontBother);
		delete bmc.sessions[this.uuid];
	}

	setAdmin() {
		if (!isndef(this.room.admin))
			this.room.admin.role = "player";
		this.room.admin = this;
		this.role = "admin";
	}

	joinPlayers() {
		if (!this.room.isPlayAvailable())
			return false;
		console.log("Join game");
		this.socket.leave(this.room.uuid + "_spec");
		this.room.specSessions.delete(this.uuid);
		this.room.sessions.set(this.uuid, this);
		if (this.room.ingame) {
			if (this.room.midgameJoining) {
				this.status = this.room.gameData.status;
				this.socket.join(this.room.uuid + "_play");
			} else {
				this.status = "idle";
				this.socket.join(this.room.uuid + "_spec");
			}
		} else {
			this.status = "idle";
			this.socket.join(this.room.uuid + "_play");
		}
		return true;
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

	setSpectator(spec) {
		if (spec && this.status != "spectator") {
			this.leaveGame();
			this.room.specSessions.set(this.uuid, this);
			this.socket.join(this.room.uuid + "_spec");
		} else if (!spec && this.status == "spectator") {
			this.joinPlayers();
		}
	}
}