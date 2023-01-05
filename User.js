const uuid = require("uuid/v1");


module.exports = class User {
	constructor ()
	{
		this.uuid = uuid();
		this.sessions = new Map();
	}

	deleteSession(session) {
		delete this.sessions[session.uuid];
		if (Object.keys(this.sessions).length == 0)
			this.delete();
	}

	delete() {
		delete BMCs.users[this.uuid];
	}
}