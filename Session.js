const uuid	= require("uuid/v1");
const u		= require("./public/scripts/utils.js")

module.exports = class Session{
	constructor (socket, room, info){
		this.uuid = uuid();
		this.socket = socket;
		this.room = room;
		this.gameData = {
			role: "player",
			status: info.spectator ? "spectator" : "idle"
		};
		this.setInfo(info);

		socket.bmc.sessions[this.uuid] = this;
		socket.bmcUser.sessions.set(this.uuid, this);
	}

	setInfo(info){
		this.gameData.info = {
			displayName: info.displayName,
			color: info.color
		}
		if (u.isndef(this.refInfo))
			this.gameData.refInfo = Object.assign({}, this.info);
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
			this.room.join(this);
		}
	}
}