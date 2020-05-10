const uuid = require("uuid/v1");


module.exports = class User {
	constructor ()
	{
		this.uuid = uuid();
		this.sessions = {};
	}

	deleteSession(session) {
		var bmc = session.socket.bmc;
		delete this.sessions[session.uuid];
		if (Object.keys(this.sessions).length == 0)
			this.delete();
	}

	delete() {
		delete bmc.users[this.uuid];
	}
}